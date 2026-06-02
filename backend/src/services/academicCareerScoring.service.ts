import { IStudentAssessmentAttempt } from "../models/StudentAssessmentAttempt";
import Question from "../models/Question";

// ── Interest Code Metadata ────────────────────────────
export type InterestCode = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";

export interface InterestMeta {
  code: InterestCode;
  name: string;
  careers: string[];
  streams: string[];
  color: string;
  icon: string;
}

export const INTEREST_META: Record<InterestCode, InterestMeta> = {
  A: {
    code: "A",
    name: "Science & Research",
    careers: ["Scientist", "Research Engineer", "Physics/Chemistry Professor", "Biotechnologist", "Data Analyst"],
    streams: ["Science (PCB)", "Science (PCM)", "Engineering Sciences"],
    color: "#6366f1",
    icon: "🔬",
  },
  B: {
    code: "B",
    name: "Commerce & Financial",
    careers: ["Chartered Accountant", "Investment Banker", "Financial Analyst", "Commerce Lecturer", "Actuary"],
    streams: ["Commerce (with Maths)", "Commerce (without Maths)", "BBA / BCom"],
    color: "#f59e0b",
    icon: "💰",
  },
  C: {
    code: "C",
    name: "Social Science, Law & Public Policy",
    careers: ["Lawyer", "Civil Services Officer (IAS/IPS)", "Policy Analyst", "Sociologist", "Political Scientist"],
    streams: ["Humanities / Arts", "Law (BA LLB)", "Political Science / Sociology"],
    color: "#ef4444",
    icon: "⚖️",
  },
  D: {
    code: "D",
    name: "Creative Arts, Design & Media",
    careers: ["UI/UX Designer", "Architect", "Graphic Designer", "Film Director", "Content Creator"],
    streams: ["Fine Arts", "Mass Communication", "Architecture", "Design (NID/NIFT)"],
    color: "#ec4899",
    icon: "🎨",
  },
  E: {
    code: "E",
    name: "Technology & Digital Systems",
    careers: ["Software Developer", "AI/ML Engineer", "Cybersecurity Analyst", "Full Stack Developer", "Robotics Engineer"],
    streams: ["Science (PCM + Computer Science)", "B.Tech (CS/IT)", "BCA"],
    color: "#0ea5e9",
    icon: "💻",
  },
  F: {
    code: "F",
    name: "Health, Biology & Human Performance",
    careers: ["Doctor (MBBS)", "Psychologist", "Physiotherapist", "Nutritionist", "Biomedical Engineer"],
    streams: ["Science (PCB)", "MBBS / BDS / BAMS", "Nursing / Physiotherapy"],
    color: "#10b981",
    icon: "🏥",
  },
  G: {
    code: "G",
    name: "Communication, Language & Education",
    careers: ["Teacher / Professor", "Journalist", "Content Writer", "Public Relations Manager", "Author"],
    streams: ["Humanities (English Literature)", "Journalism / Mass Comm", "B.Ed / Education"],
    color: "#8b5cf6",
    icon: "📚",
  },
  H: {
    code: "H",
    name: "Entrepreneurship, Leadership & Management",
    careers: ["Entrepreneur", "Business Manager", "Marketing Strategist", "Product Manager", "Startup Founder"],
    streams: ["Commerce / BBA / MBA", "Management Studies", "Business Administration"],
    color: "#f97316",
    icon: "🚀",
  },
  I: {
    code: "I",
    name: "Environment, Sustainability & Agriculture",
    careers: ["Environmental Scientist", "Urban Planner", "Agricultural Engineer", "Conservation Biologist", "Climate Analyst"],
    streams: ["Science (PCB/PCM)", "Environmental Science", "Agriculture / Forestry"],
    color: "#14b8a6",
    icon: "🌱",
  },
  J: {
    code: "J",
    name: "Social Impact, Community & Helping",
    careers: ["Social Worker", "Counselor", "NGO Leader", "Community Development Officer", "Human Rights Activist"],
    streams: ["Social Work (BSW)", "Psychology", "Humanities / Sociology"],
    color: "#a855f7",
    icon: "🤝",
  },
};

// ── Interest Score Interface ────────────────────────────
export interface IInterestScore {
  code: InterestCode;
  score: number;
  level: string;
  percentage: number;
}

// ── Scoring Helpers ────────────────────────────────
export function getInterestLevel(score: number): string {
  if (score >= 24) return "Very Strong";
  if (score >= 18) return "Strong";
  if (score >= 12) return "Moderate";
  if (score >= 6) return "Low";
  return "Very Low";
}

export function computeScores(
  codeCounts: Record<InterestCode, number>,
  totalQuestions: number
): IInterestScore[] {
  const codes: InterestCode[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  return codes.map((code) => {
    const score = codeCounts[code] ?? 0;
    return {
      code,
      score,
      level: getInterestLevel(score),
      percentage: Math.round((score / totalQuestions) * 100),
    };
  });
}

// ── Stream Recommendation Analysis ────────────────────────────
export function buildStreamAnalysis(
  topInterests: InterestCode[],
  scores: IInterestScore[]
) {
  const top = topInterests.slice(0, 3);
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];

  const sciPCM: InterestCode[] = ["A", "E"];
  const sciPCB: InterestCode[] = ["A", "F", "I"];
  const commerce: InterestCode[] = ["B", "H"];
  const humanities: InterestCode[] = ["C", "D", "G", "J"];

  // Use percentage scores for fair comparison
  const scoreMap = Object.fromEntries(scores.map((s) => [s.code, s.percentage]));

  // Sort by raw score descending to determine rank
  const sortedCodes = [...scores]
    .sort((a, b) => b.score - a.score)
    .map((s) => s.code as InterestCode);

  // Positional multiplier: rank 1 = 4×, rank 2 = 2.5×, rank 3 = 1.5×, rest = 0.5×
  const rankMultiplier = (code: InterestCode): number => {
    const rank = sortedCodes.indexOf(code);
    if (rank === 0) return 4.0;
    if (rank === 1) return 2.5;
    if (rank === 2) return 1.5;
    return 0.5;
  };

  // Weighted average per stream
  const streamScore = (codes: InterestCode[]): number =>
    codes.reduce((sum, c) => sum + (scoreMap[c] ?? 0) * rankMultiplier(c), 0) / codes.length;

  const pcmScore = streamScore(sciPCM);
  const pcbScore = streamScore(sciPCB);
  const comScore = streamScore(commerce);
  const humScore = streamScore(humanities);

  const maxScore = Math.max(pcmScore, pcbScore, comScore, humScore);
  const total = pcmScore + pcbScore + comScore + humScore;
  const dominance = total > 0 ? maxScore / total : 0;

  const confidence = dominance >= 0.42 ? "Strong Fit" : dominance >= 0.28 ? "Good Fit" : "Exploratory";

  let recommendedStream = "Science (PCM)";
  let streamReasoning = "";
  let guidancePoints: string[] = [];
  let cautionAreas: string[] = [];
  let futureOpportunities: string[] = [];
  let supportingDomains: string[] = [];
  let learningCompatibility = "";

  if (maxScore === pcmScore) {
    recommendedStream = "Science (PCM) - Physics, Chemistry, Mathematics";
    streamReasoning = `Your ${top.map((c) => INTEREST_META[c].name).join(" and ")} interests align strongly with analytical and technological disciplines. PCM opens doors to engineering, AI, mathematics, and technology-driven careers.`;
    guidancePoints = [
      "Strong alignment with Physics, Mathematics, and Computer Science",
      "PCM is the gateway to engineering, data science, AI, and research careers",
      "Your logical and tech-oriented thinking makes you well-suited for problem-solving domains",
      "Consider adding Computer Science as an optional subject",
    ];
    cautionAreas = [
      "Biology and life sciences are less emphasized in this stream",
      "PCM demands strong mathematical reasoning - build a consistent practice habit",
      "Avoid neglecting communication and soft skills alongside technical subjects",
    ];
    futureOpportunities = [
      "Engineering (IIT/NIT/BITS)",
      "Data Science & AI",
      "Software Development",
      "Mathematics/Physics Research",
      "Robotics & Automation",
      "Fintech & Analytics",
    ];
    supportingDomains = top.filter((c) => [...sciPCM, "I"].includes(c)).map((c) => INTEREST_META[c].name);
    learningCompatibility = "Logical, analytical, and hands-on learner. Excels in structured problem-solving, experiments, and technology-driven projects.";
  } else if (maxScore === pcbScore) {
    recommendedStream = "Science (PCB) - Physics, Chemistry, Biology";
    streamReasoning = `Your ${top.map((c) => INTEREST_META[c].name).join(" and ")} interests reflect a strong inclination toward life sciences, health, and natural systems. PCB is the pathway to medicine, biology, and environmental sciences.`;
    guidancePoints = [
      "Aligned with Biology, Chemistry, and health-related disciplines",
      "PCB prepares you for NEET, AIIMS, and allied health science programmes",
      "Your empathetic and detail-oriented nature suits medical and biological research",
      "Environmental Science can be a powerful elective to complement this stream",
    ];
    cautionAreas = [
      "Mathematics becomes less central in this stream - keep foundational skills sharp",
      "Medical careers are highly competitive; supplement with research skills",
      "Avoid limiting yourself to only medicine; explore biotechnology and public health too",
    ];
    futureOpportunities = [
      "Medicine (MBBS/BDS)",
      "Biotechnology",
      "Physiotherapy & Nutrition",
      "Environmental Science",
      "Psychology",
      "Forensic Science",
    ];
    supportingDomains = top.filter((c) => sciPCB.includes(c)).map((c) => INTEREST_META[c].name);
    learningCompatibility = "Visual and empathetic learner. Excels with diagrams, case studies, biological models, and understanding human systems.";
  } else if (maxScore === comScore) {
    recommendedStream = "Commerce - Economics, Business Studies, Mathematics";
    streamReasoning = `Your ${top.map((c) => INTEREST_META[c].name).join(" and ")} interests point toward business thinking, financial systems, and leadership. Commerce is the foundation for entrepreneurship, management, and financial careers.`;
    guidancePoints = [
      "Strong fit with Economics, Business Studies, and Accountancy",
      "Commerce with Mathematics expands your quantitative and analytical skills",
      "Your entrepreneurial mindset is a significant asset in Commerce",
      "CA, CFA, MBA, and BBA are natural post-secondary directions",
    ];
    cautionAreas = [
      "Commerce without Maths limits certain career paths (like Chartered Accountancy or Actuarial Science)",
      "Avoid assuming Commerce is 'easier' - it requires analytical discipline",
      "Build a strong awareness of global economics and current business affairs",
    ];
    futureOpportunities = [
      "Chartered Accountancy (CA)",
      "MBA / BBA",
      "Investment Banking",
      "Entrepreneurship",
      "Marketing & Brand Management",
      "Financial Planning",
    ];
    supportingDomains = top.filter((c) => commerce.includes(c)).map((c) => INTEREST_META[c].name);
    learningCompatibility = "Goal-driven and practical learner. Excels through real-world examples, business simulations, and competitive challenges.";
  } else {
    recommendedStream = "Humanities & Arts - History, Political Science, Psychology";
    streamReasoning = `Your ${top.map((c) => INTEREST_META[c].name).join(" and ")} interests reflect a deep alignment with human society, creativity, and communication. Humanities is a rich pathway for law, social sciences, media, and public service.`;
    guidancePoints = [
      "Strong fit with History, Political Science, Psychology, and Sociology",
      "Humanities opens doors to UPSC, law, journalism, and social impact careers",
      "Your empathetic and creative thinking is a major strength in this stream",
      "Psychology or Fine Arts can be powerful elective choices",
    ];
    cautionAreas = [
      "Build analytical writing and critical reasoning skills early",
      "Avoid undervaluing Humanities - it leads to some of the most impactful careers",
      "Supplement with digital literacy and communication skills for modern relevance",
    ];
    futureOpportunities = [
      "Civil Services (IAS/IPS/IFS)",
      "Law (BA LLB)",
      "Journalism & Media",
      "Psychology & Counseling",
      "Social Work & NGOs",
      "Content, Writing & Publishing",
    ];
    supportingDomains = top.filter((c) => humanities.includes(c)).map((c) => INTEREST_META[c].name);
    learningCompatibility = "Reflective and communicative learner. Excels through reading, discussion, creative writing, and understanding human behaviour.";
  }

  return {
    recommendedStream,
    confidence,
    streamReasoning,
    guidancePoints,
    cautionAreas,
    futureOpportunities,
    suggestedCareers: top.flatMap((c) => INTEREST_META[c].careers.slice(0, 2)).slice(0, 6),
    supportingDomains,
    learningCompatibility,
  };
}

// ── Determine Top Interests ────────────────────────────
export function getTopInterests(scores: IInterestScore[], count: number = 3): InterestCode[] {
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.code as InterestCode);
}

// ── Generate Full Report Evaluation Object ────────────────────────────
export interface AcademicCareerEvaluation {
  interestScores: IInterestScore[];
  topInterests: InterestCode[];
  streamAnalysis: ReturnType<typeof buildStreamAnalysis>;
  completedAt: Date;
}

// ── Main Evaluation Function ────────────────────────────
export async function evaluateAcademicCareerAnswers(attempt: IStudentAssessmentAttempt): Promise<AcademicCareerEvaluation> {
  // Count interest codes from answers
  const interestCounts: Record<InterestCode, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
    G: 0,
    H: 0,
    I: 0,
    J: 0,
  };

  // Process each question to extract the interest code
  for (const question of attempt.questions) {
    if (!question.answer || question.answer === "") continue;

    // Try to find the original question to get the answer mapping
    try {
      const originalQuestion = await Question.findById(question.questionId);
      if (originalQuestion && originalQuestion.correctAnswer) {
        // correctAnswer stores JSON mapping like {"A": "X", "B": "Y", ...}
        const answerMap = JSON.parse(originalQuestion.correctAnswer);
        const selectedInterestCode = answerMap[question.answer];

        if (selectedInterestCode && selectedInterestCode in interestCounts) {
          interestCounts[selectedInterestCode as InterestCode]++;
        }
      }
    } catch (error) {
      console.error(`Error evaluating question ${question.questionId}:`, error);
    }
  }

  // Calculate scores and analysis
  const interestScores = computeScores(interestCounts, attempt.totalQuestions);
  const topInterests = getTopInterests(interestScores);
  const streamAnalysis = buildStreamAnalysis(topInterests, interestScores);

  return {
    interestScores,
    topInterests,
    streamAnalysis,
    completedAt: new Date(),
  };
}
