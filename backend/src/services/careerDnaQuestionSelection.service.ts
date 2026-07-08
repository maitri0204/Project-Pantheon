import { parseCareerDnaCategory } from "./sourceAssessmentData";

const CAREER_DNA_TEST_ORDER = [
  "APTITUDE",
  "BEHAVIORAL_SOCIAL",
  "CAREER_INTEREST",
  "COGNITIVE",
  "EMOTIONAL_INTELLIGENCE",
  "LEARNING_STYLE",
  "PERSONALITY",
  "STRESS_RESILIENCE",
];

const CAREER_DNA_NON_HALVED_TEST_TYPES = new Set(["PERSONALITY"]);

const shuffleArray = <T,>(items: T[]): T[] => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

export function buildCareerDnaQuestionSetForAttempt<T extends {
  category: string;
  questionNumber: number;
  sourceTestType?: string;
  partNumber?: number;
}>(questions: T[]): T[] {
  if (!questions.length) {
    return questions;
  }

  const grouped = new Map<string, {
    category: string;
    testType: string;
    partNumber: number;
    items: T[];
  }>();

  for (const question of questions) {
    const parsed = parseCareerDnaCategory(question.category);
    const testType = question.sourceTestType || parsed?.testType || "";
    const partNumber = Number.isFinite(Number(question.partNumber))
      ? Number(question.partNumber)
      : Number(parsed?.partNumber ?? 1);
    const key = String(question.category || `${testType}::${partNumber}`);

    const group = grouped.get(key);
    if (group) {
      group.items.push(question);
      continue;
    }

    grouped.set(key, {
      category: key,
      testType,
      partNumber,
      items: [question],
    });
  }

  const orderedGroups = Array.from(grouped.values()).sort((a, b) => {
    const leftOrder = CAREER_DNA_TEST_ORDER.indexOf(a.testType);
    const rightOrder = CAREER_DNA_TEST_ORDER.indexOf(b.testType);

    const normalizedLeftOrder = leftOrder === -1 ? Number.MAX_SAFE_INTEGER : leftOrder;
    const normalizedRightOrder = rightOrder === -1 ? Number.MAX_SAFE_INTEGER : rightOrder;

    if (normalizedLeftOrder !== normalizedRightOrder) {
      return normalizedLeftOrder - normalizedRightOrder;
    }

    return a.partNumber - b.partNumber;
  });

  return orderedGroups.flatMap((group) => {
    const shuffled = shuffleArray(group.items);
    let takeCount: number;
    if (group.testType === "PERSONALITY") {
      takeCount = group.partNumber <= 4 ? Math.min(7, shuffled.length) : shuffled.length;
    } else {
      const isNonHalved = CAREER_DNA_NON_HALVED_TEST_TYPES.has(group.testType);
      takeCount = isNonHalved
        ? shuffled.length
        : Math.max(1, Math.floor(shuffled.length / 2));
    }

    return shuffled.slice(0, takeCount);
  });
}
