import { IStudentAssessmentAttempt } from "../models/StudentAssessmentAttempt";
import { getCareerDnaSourceQuestion, parseCareerDnaCategory } from "./sourceAssessmentData";

const CAREER_COMPASS_DIMENSION_MAP: Record<number, { a: string; b: string }> = {
  1: { a: "E", b: "I" },
  2: { a: "S", b: "N" },
  3: { a: "T", b: "F" },
  4: { a: "J", b: "P" },
};

const CAREER_COMPASS_REFLECTION_MAP: Record<number, { a: string; b: string }> = {
  1: { a: "E", b: "I" },
  2: { a: "N", b: "S" },
  3: { a: "T", b: "F" },
  4: { a: "J", b: "P" },
  5: { a: "N", b: "S" },
  6: { a: "S", b: "N" },
  7: { a: "F", b: "T" },
  8: { a: "I", b: "E" },
  9: { a: "J", b: "P" },
  10: { a: "N", b: "S" },
};

const CAREER_COMPASS_DIMENSION_NAMES: Record<string, string> = {
  E: "Social Orientation",
  I: "Reflective Orientation",
  S: "Practical Observation",
  N: "Conceptual Thinking",
  T: "Logical Decision Style",
  F: "Value-Based Decision Style",
  J: "Structured Working Style",
  P: "Flexible Working Style",
};

const CAREER_COMPASS_DESCRIPTIONS: Record<string, string> = {
  ISTJ: "The Systematic Organizer – Responsible, thorough, and dependable. You value tradition and loyalty.",
  ISFJ: "The Protective Supporter – Warm, considerate, and dedicated to helping others in a practical way.",
  INFJ: "The Purpose Driven Guide – Insightful, principled, and compassionate. You seek meaning and connection.",
  INTJ: "The Master Strategist – Strategic, determined, and independent. You love complex challenges.",
  ISTP: "The Practical Problem Solver – Observant, analytical, and hands-on. You enjoy understanding how things work.",
  ISFP: "The Artist – Gentle, sensitive, and artistic. You live in the moment and value harmony.",
  INFP: "The Value Creator – Idealistic, empathetic, and creative. You strive to make the world better.",
  INTP: "The Curious – Logical, innovative, and curious. You love exploring ideas and theories.",
  ESTP: "The Action Taker – Energetic, pragmatic, and action-oriented. You thrive on excitement.",
  ESFP: "The Joyful Performer – Spontaneous, fun-loving, and sociable. You bring joy to those around you.",
  ENFP: "The Visionary – Enthusiastic, creative, and people-oriented. You see potential everywhere.",
  ENTP: "The Entrepreneur – Quick-witted, clever, and outspoken. You love intellectual challenges.",
  ESTJ: "The Strategic Leader – Organized, logical, and assertive. You take charge and get things done.",
  ESFJ: "The Community Builder – Caring, social, and traditional. You prioritize harmony and cooperation.",
  ENFJ: "The Mentor Leader – Charismatic, empathetic, and organized. You inspire and lead others.",
  ENTJ: "The Visionary Director – Bold, imaginative, and strong-willed. You are a natural leader.",
};

const JOHARI_SOLICITS_FEEDBACK_ITEMS = [
  { questionNumber: 2, option: "B" },
  { questionNumber: 3, option: "A" },
  { questionNumber: 5, option: "A" },
  { questionNumber: 7, option: "A" },
  { questionNumber: 8, option: "B" },
  { questionNumber: 10, option: "B" },
  { questionNumber: 12, option: "B" },
  { questionNumber: 14, option: "B" },
  { questionNumber: 16, option: "A" },
  { questionNumber: 20, option: "A" },
] as const;

const JOHARI_SELF_DISCLOSURE_ITEMS = [
  { questionNumber: 1, option: "A" },
  { questionNumber: 4, option: "B" },
  { questionNumber: 6, option: "B" },
  { questionNumber: 9, option: "B" },
  { questionNumber: 11, option: "B" },
  { questionNumber: 13, option: "A" },
  { questionNumber: 15, option: "A" },
  { questionNumber: 17, option: "B" },
  { questionNumber: 18, option: "B" },
  { questionNumber: 19, option: "B" },
] as const;

const CAREER_DNA_DIMENSION_OPPOSITE: Record<string, string> = { E: "I", I: "E", S: "N", N: "S", T: "F", F: "T", J: "P", P: "J" };
const CAREER_DNA_EQ_NAMES: Record<number, string> = { 1: "Self-Awareness", 2: "Emotional Regulation", 3: "Empathy", 4: "Social Skills" };
const CAREER_DNA_LS_NAMES: Record<number, string> = { 1: "Visual", 2: "Auditory", 3: "Reading/Writing", 4: "Kinesthetic", 5: "Logical", 6: "Social", 7: "Solitary", 8: "Musical" };
const CAREER_DNA_BS_NAMES: Record<number, string> = { 1: "Adaptability", 2: "Teamwork", 3: "Leadership Skills", 4: "Communication Skills" };
const CAREER_DNA_SR_NAMES: Record<number, string> = { 1: "Stress Triggers & Awareness", 2: "Emotional Coping Strategies", 3: "Problem-Solving & Self-Talk", 4: "Resilience & Bounce-Back Skills" };
const CAREER_DNA_RIASEC_MAP: Record<number, { code: string; title: string }> = {
  1: { code: "R", title: "Realistic" },
  2: { code: "I", title: "Investigative" },
  3: { code: "A", title: "Artistic" },
  4: { code: "S", title: "Social" },
  5: { code: "E", title: "Enterprising" },
  6: { code: "C", title: "Conventional" },
};
const CAREER_DNA_LS_CODES = ["V", "A", "R", "K", "L", "S", "I", "M"];

function getOptionScore(answer: number, option: "A" | "B") {
  return option === "A" ? answer : 5 - answer;
}

function computeJohariQuadrants(sfScore: number, sdScore: number) {
  const total = 50 * 50;
  const open = Number(((sfScore * sdScore) / total * 100).toFixed(1));
  const blind = Number(((sfScore * (50 - sdScore)) / total * 100).toFixed(1));
  const hidden = Number((((50 - sfScore) * sdScore) / total * 100).toFixed(1));
  const unknown = Number((((50 - sfScore) * (50 - sdScore)) / total * 100).toFixed(1));
  return { open, blind, hidden, unknown };
}

function getDominantJohariQuadrant(sfScore: number, sdScore: number) {
  const quadrants = computeJohariQuadrants(sfScore, sdScore);
  const max = Math.max(quadrants.open, quadrants.blind, quadrants.hidden, quadrants.unknown);
  if (max === quadrants.open) return "Open Area";
  if (max === quadrants.blind) return "Blind Spot";
  if (max === quadrants.hidden) return "Hidden Area";
  return "Unknown";
}

function evaluateCareerCompass(attempt: IStudentAssessmentAttempt) {
  const counts: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  for (const question of attempt.questions) {
    const answer = question.answer;
    if (!answer) continue;

    const partNumber = Number(question.category);
    const dimension = partNumber === 5
      ? CAREER_COMPASS_REFLECTION_MAP[question.questionNumber]
      : CAREER_COMPASS_DIMENSION_MAP[partNumber];

    if (!dimension) continue;

    if (answer === "A") counts[dimension.a] += 1;
    if (answer === "B") counts[dimension.b] += 1;
  }

  const pairs = [
    { a: "E", b: "I" },
    { a: "S", b: "N" },
    { a: "T", b: "F" },
    { a: "J", b: "P" },
  ];

  let personalityType = "";
  const dimensions = pairs.map(({ a, b }) => {
    const total = counts[a] + counts[b];
    const percentA = total > 0 ? Math.round((counts[a] / total) * 100) : 50;
    const percentB = total > 0 ? Math.round((counts[b] / total) * 100) : 50;
    const winner = counts[a] >= counts[b] ? a : b;
    personalityType += winner;

    return {
      pair: `${a}/${b}`,
      letterA: a,
      letterB: b,
      nameA: CAREER_COMPASS_DIMENSION_NAMES[a],
      nameB: CAREER_COMPASS_DIMENSION_NAMES[b],
      countA: counts[a],
      countB: counts[b],
      percentA,
      percentB,
      winner,
    };
  });

  return {
    assessmentCode: attempt.assessmentCode,
    personalityType,
    description: CAREER_COMPASS_DESCRIPTIONS[personalityType] || "",
    dimensions,
    totalAnswered: attempt.questions.filter((question) => !!question.answer).length,
  };
}

function evaluateJohari(attempt: IStudentAssessmentAttempt) {
  const scoreByQuestion = new Map<number, number>();
  for (const question of attempt.questions) {
    const numericAnswer = Number(question.answer);
    if (!Number.isFinite(numericAnswer)) continue;
    scoreByQuestion.set(question.questionNumber, numericAnswer);
  }

  let solicitsFeedbackScore = 0;
  let selfDisclosureScore = 0;

  const solicitsFeedbackBreakdown = JOHARI_SOLICITS_FEEDBACK_ITEMS.map(({ questionNumber, option }) => {
    const scoreA = scoreByQuestion.get(questionNumber) ?? 0;
    const score = getOptionScore(scoreA, option);
    solicitsFeedbackScore += score;
    return { questionNumber, option, score };
  });

  const selfDisclosureBreakdown = JOHARI_SELF_DISCLOSURE_ITEMS.map(({ questionNumber, option }) => {
    const scoreA = scoreByQuestion.get(questionNumber) ?? 0;
    const score = getOptionScore(scoreA, option);
    selfDisclosureScore += score;
    return { questionNumber, option, score };
  });

  return {
    assessmentCode: attempt.assessmentCode,
    solicitsFeedbackScore,
    selfDisclosureScore,
    dominantQuadrant: getDominantJohariQuadrant(solicitsFeedbackScore, selfDisclosureScore),
    quadrants: computeJohariQuadrants(solicitsFeedbackScore, selfDisclosureScore),
    solicitsFeedbackBreakdown,
    selfDisclosureBreakdown,
    totalAnswered: scoreByQuestion.size,
  };
}

function evaluateLitmus(attempt: IStudentAssessmentAttempt) {
  const styleScores: Record<string, number> = { K: 0, S: 0, E: 0, P: 0, J: 0 };

  for (const question of attempt.questions) {
    const selected = question.options.find((option) => option.label === question.answer);
    const score = selected?.score ?? Number(question.answer ?? 0) ?? 0;
    if (styleScores[question.category] !== undefined) {
      styleScores[question.category] += Number.isFinite(score) ? score : 0;
    }
  }

  const totalScore = Object.values(styleScores).reduce((sum, value) => sum + value, 0);
  const dominantStyle = Object.entries(styleScores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "K";

  return {
    assessmentCode: attempt.assessmentCode,
    styleScores,
    totalScore,
    dominantStyle,
  };
}

function evaluateMetacognition(attempt: IStudentAssessmentAttempt) {
  const domainScores: Record<string, number> = {};

  for (const question of attempt.questions) {
    const selected = question.options.find((option) => option.label === question.answer);
    const score = selected?.score ?? 0;
    const key = `domain${question.category}`;
    domainScores[key] = (domainScores[key] ?? 0) + score;
  }

  const totalScore = Object.values(domainScores).reduce((sum, value) => sum + value, 0);
  return {
    assessmentCode: attempt.assessmentCode,
    domainScores,
    totalScore,
  };
}

type CareerDnaSourceQuestion = {
  testType: string;
  partNumber: number;
  partName: string;
  questionNumber: number;
  questionText: string;
  correctAnswer: string;
};

function computeCareerDnaBreakdown(
  testType: string,
  answers: Record<string, string>,
  questions: CareerDnaSourceQuestion[]
) {
  if (testType === "COGNITIVE" || testType === "APTITUDE") {
    const partMap = new Map<number, { partName: string; score: number; total: number }>();
    for (const question of questions) {
      if (!partMap.has(question.partNumber)) {
        partMap.set(question.partNumber, { partName: question.partName, score: 0, total: 0 });
      }
      const part = partMap.get(question.partNumber)!;
      part.total += 1;
      const answer = (answers[String(question.questionNumber)] ?? "").toUpperCase();
      if (answer && question.correctAnswer && answer === question.correctAnswer.toUpperCase()) {
        part.score += 1;
      }
    }

    const parts = Array.from(partMap.entries()).sort((a, b) => a[0] - b[0]).map(([partNumber, part]) => ({
      partNumber,
      partName: part.partName,
      score: part.score,
      maxScore: part.total,
      percentage: part.total ? Math.round((part.score / part.total) * 100) : 0,
    }));

    const totalScore = parts.reduce((sum, part) => sum + part.score, 0);
    const maxScore = parts.reduce((sum, part) => sum + part.maxScore, 0);
    return { parts, totalScore, maxScore, overallPercentage: maxScore ? Math.round((totalScore / maxScore) * 100) : 0 };
  }

  if (testType === "PERSONALITY") {
    const counts: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    for (const question of questions) {
      const answer = answers[String(question.questionNumber)];
      if (!answer || !question.correctAnswer) continue;
      const dimA = question.correctAnswer;
      const dimB = CAREER_DNA_DIMENSION_OPPOSITE[dimA];
      if (!dimB) continue;
      if (answer === "A") counts[dimA] += 1;
      if (answer === "B") counts[dimB] += 1;
    }

    const pairs: Array<[string, string]> = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];
    const personalityDimensions = pairs.map(([a, b]) => {
      const total = counts[a] + counts[b] || 1;
      return {
        pair: `${a}/${b}`,
        winner: counts[a] >= counts[b] ? a : b,
        letterA: a,
        letterB: b,
        percentA: Math.round((counts[a] / total) * 100),
        percentB: Math.round((counts[b] / total) * 100),
      };
    });

    const personalityType = personalityDimensions.map((dimension) => dimension.winner).join("");
    const parts = personalityDimensions.map((dimension, index) => ({
      partNumber: index + 1,
      partName: dimension.pair,
      score: Math.max(dimension.percentA, dimension.percentB),
      maxScore: 100,
      percentage: Math.max(dimension.percentA, dimension.percentB),
    }));

    return { parts, totalScore: 0, maxScore: 0, overallPercentage: 0, personalityType, personalityDimensions };
  }

  if (testType === "CAREER_INTEREST") {
    const domainMap = new Map<string, { title: string; partNumber: number; yes: number; total: number }>();
    for (const [partNumber, info] of Object.entries(CAREER_DNA_RIASEC_MAP)) {
      domainMap.set(info.code, { title: info.title, partNumber: Number(partNumber), yes: 0, total: 0 });
    }

    for (const question of questions) {
      const domain = CAREER_DNA_RIASEC_MAP[question.partNumber];
      if (!domain) continue;
      const entry = domainMap.get(domain.code)!;
      entry.total += 1;
      if ((answers[String(question.questionNumber)] ?? "").toUpperCase() === "A") {
        entry.yes += 1;
      }
    }

    const parts = Array.from(domainMap.entries())
      .map(([code, domain]) => ({
        partNumber: domain.partNumber,
        partName: `${code} — ${domain.title}`,
        score: domain.yes,
        maxScore: domain.total,
        percentage: domain.total ? Math.round((domain.yes / domain.total) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const dominantCode = parts.slice(0, 3).map((part) => part.partName.split(" ")[0]).join("");
    const totalScore = parts.reduce((sum, part) => sum + part.score, 0);
    const maxScore = parts.reduce((sum, part) => sum + part.maxScore, 0);
    return { parts, totalScore, maxScore, overallPercentage: maxScore ? Math.round((totalScore / maxScore) * 100) : 0, dominantCode };
  }

  const componentNames = testType === "EMOTIONAL_INTELLIGENCE"
    ? CAREER_DNA_EQ_NAMES
    : testType === "LEARNING_STYLE"
      ? CAREER_DNA_LS_NAMES
      : testType === "BEHAVIORAL_SOCIAL"
        ? CAREER_DNA_BS_NAMES
        : CAREER_DNA_SR_NAMES;

  const scoreMapBase: Record<string, number> = testType === "LEARNING_STYLE"
    ? { A: 3, B: 2, C: 1 }
    : { A: 4, B: 3, C: 2, D: 1 };
  const scoreMapReverse: Record<string, number> = { A: 1, B: 2, C: 3, D: 4 };
  const maxPerQuestion = testType === "LEARNING_STYLE" ? 3 : 4;

  const partMap = new Map<number, { partName: string; score: number; maxScore: number }>();
  for (const question of questions) {
    if (!partMap.has(question.partNumber)) {
      partMap.set(question.partNumber, {
        partName: componentNames[question.partNumber] || question.partName,
        score: 0,
        maxScore: 0,
      });
    }

    const part = partMap.get(question.partNumber)!;
    const answer = (answers[String(question.questionNumber)] ?? "").toUpperCase();
    part.maxScore += maxPerQuestion;
    part.score += (testType === "STRESS_RESILIENCE" && question.questionText.trim().endsWith("*"))
      ? (scoreMapReverse[answer] || 0)
      : (scoreMapBase[answer] || 0);
  }

  const parts = Array.from(partMap.entries()).sort((a, b) => a[0] - b[0]).map(([partNumber, part]) => ({
    partNumber,
    partName: part.partName,
    score: part.score,
    maxScore: part.maxScore,
    percentage: part.maxScore ? Math.round((part.score / part.maxScore) * 100) : 0,
  }));

  const totalScore = parts.reduce((sum, part) => sum + part.score, 0);
  const maxScore = parts.reduce((sum, part) => sum + part.maxScore, 0);

  let dominantCode: string | undefined;
  if (testType === "LEARNING_STYLE") {
    // Only consider Visual (0), Auditory (1), Kinesthetic (3) - filter to indices 0, 1, 3
    const filteredParts = [...parts].filter((part) => {
      const idx = part.partNumber - 1;
      return idx === 0 || idx === 1 || idx === 3; // V, A, K
    });
    // Take only top 2 (primary and secondary)
    dominantCode = filteredParts
      .sort((a, b) => b.percentage - a.percentage || b.score - a.score)
      .slice(0, 2)
      .map((part) => CAREER_DNA_LS_CODES[part.partNumber - 1] ?? String(part.partNumber))
      .join("");
  }

  return {
    parts,
    totalScore,
    maxScore,
    overallPercentage: maxScore ? Math.round((totalScore / maxScore) * 100) : 0,
    dominantCode,
  };
}

function evaluateCareerDna(attempt: IStudentAssessmentAttempt) {
  const sectionQuestions = new Map<string, CareerDnaSourceQuestion[]>();
  const sectionAnswers = new Map<string, Record<string, string>>();

  for (const question of attempt.questions) {
    const parsed = parseCareerDnaCategory(question.category);
    if (!parsed) continue;

    const sourceQuestion = getCareerDnaSourceQuestion(parsed.testType, parsed.partNumber, question.questionNumber);
    if (!sourceQuestion) continue;

    if (!sectionQuestions.has(parsed.testType)) {
      sectionQuestions.set(parsed.testType, []);
    }
    sectionQuestions.get(parsed.testType)!.push(sourceQuestion);

    if (!sectionAnswers.has(parsed.testType)) {
      sectionAnswers.set(parsed.testType, {});
    }
    if (question.answer) {
      sectionAnswers.get(parsed.testType)![String(question.questionNumber)] = question.answer;
    }
  }

  const sections: Record<string, unknown> = {};
  let totalScore = 0;
  for (const [testType, questions] of sectionQuestions.entries()) {
    const breakdown = computeCareerDnaBreakdown(testType, sectionAnswers.get(testType) ?? {}, questions);
    sections[testType] = breakdown;
    totalScore += Number((breakdown as { totalScore?: number }).totalScore ?? 0);
  }

  return {
    assessmentCode: attempt.assessmentCode,
    totalScore,
    sections,
  };
}

export async function evaluateAssessmentAttempt(attempt: IStudentAssessmentAttempt) {
  switch (attempt.assessmentCode) {
    case "CAREER_COMPASS":
      return evaluateCareerCompass(attempt);
    case "JOHARI_WINDOW":
      return evaluateJohari(attempt);
    case "LITMUS_TEST":
      return evaluateLitmus(attempt);
    case "METACOGNITION_TEST":
    case "METACOGNITION":
      return evaluateMetacognition(attempt);
    case "CAREER_DNA":
      return evaluateCareerDna(attempt);
    default:
      return {
        assessmentCode: attempt.assessmentCode,
        answeredCount: attempt.answeredCount,
        totalQuestions: attempt.totalQuestions,
      };
  }
}
