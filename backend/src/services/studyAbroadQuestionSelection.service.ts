import type { IAttemptQuestion } from "../models/StudentAssessmentAttempt";

export const STUDY_ABROAD_TOPICS = [
  "Language Readiness",
  "Scholastic Readiness",
  "Academic Readiness",
  "Career & Employability Readiness",
  "Financial Readiness",
  "Visa & Compliance Readiness",
  "Psychological Readiness",
  "Social & Cultural Readiness",
  "Parental Expectation Readiness",
  "Physical & Lifestyle Readiness",
  "Resilience Readiness",
  "Decision Readiness",
] as const;

export type StudyAbroadTopic = (typeof STUDY_ABROAD_TOPICS)[number];

const shuffleArray = <T,>(arr: T[]): T[] => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const pickRandom = <T,>(arr: T[], n: number): T[] => shuffleArray(arr).slice(0, n);

const shuffleOptionsForQuestion = (question: IAttemptQuestion): IAttemptQuestion => {
  const shuffled = shuffleArray([...(question.options || [])]);
  const relabeled = shuffled.map((option, index) => ({
    ...option,
    label: String.fromCharCode(65 + index),
  }));

  return {
    ...question,
    options: relabeled,
  };
};

/**
 * Selects 50 questions for a session (4 per topic + 2 bonus), matching Study-Abroad logic.
 */
export function buildStudyAbroadQuestionSetForAttempt<T extends {
  category: string;
  questionNumber: number;
}>(
  questions: T[],
  usedQuestionNumbers: number[] = []
): T[] {
  if (!questions.length) {
    return questions;
  }

  const usedIds = new Set(usedQuestionNumbers);
  const byTopic = new Map<string, T[]>();

  STUDY_ABROAD_TOPICS.forEach((topic) => byTopic.set(topic, []));
  questions.forEach((question) => {
    const topic = String(question.category || "");
    if (!byTopic.has(topic)) {
      byTopic.set(topic, []);
    }
    byTopic.get(topic)!.push(question);
  });

  const perTopicPicked = new Map<string, T[]>();

  STUDY_ABROAD_TOPICS.forEach((topic) => {
    const all = byTopic.get(topic) || [];
    const unused = all.filter((q) => !usedIds.has(q.questionNumber));
    const pool = unused.length >= 4 ? unused : all;
    perTopicPicked.set(topic, pickRandom(pool, Math.min(4, pool.length)));
  });

  const eligibleBonus = STUDY_ABROAD_TOPICS.filter((topic) => {
    const all = byTopic.get(topic) || [];
    const pickedSet = new Set((perTopicPicked.get(topic) || []).map((q) => q.questionNumber));
    return all.some((q) => !pickedSet.has(q.questionNumber));
  });
  const bonusTopics = pickRandom(eligibleBonus, Math.min(2, eligibleBonus.length));

  const all50: T[] = [];
  STUDY_ABROAD_TOPICS.forEach((topic) => {
    const picked = perTopicPicked.get(topic) || [];
    all50.push(...picked);
    if (bonusTopics.includes(topic)) {
      const all = byTopic.get(topic) || [];
      const pickedSet = new Set(picked.map((q) => q.questionNumber));
      const bonus = pickRandom(all.filter((q) => !pickedSet.has(q.questionNumber)), 1);
      all50.push(...bonus);
    }
  });

  return shuffleArray(all50);
}

/** Shuffle option order per question; preserve bank questionNumber (1–150) for anti-repeat tracking. */
export function mapStudyAbroadAttemptQuestions(questions: IAttemptQuestion[]): IAttemptQuestion[] {
  return questions.map((question) => shuffleOptionsForQuestion(question));
}
