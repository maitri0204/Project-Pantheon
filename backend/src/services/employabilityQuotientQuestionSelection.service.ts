import type { IAttemptQuestion } from "../models/StudentAssessmentAttempt";

const shuffleArray = <T,>(arr: T[]): T[] => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

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

/** Shuffle option order per question while preserving each option's score for evaluation. */
export function mapEmployabilityQuotientAttemptQuestions(questions: IAttemptQuestion[]): IAttemptQuestion[] {
  return questions.map((question) => shuffleOptionsForQuestion(question));
}
