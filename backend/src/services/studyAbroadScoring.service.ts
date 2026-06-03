import { IStudentAssessmentAttempt } from "../models/StudentAssessmentAttempt";
import {
  STUDY_ABROAD_TOPICS,
  type StudyAbroadTopic,
} from "./studyAbroadQuestionSelection.service";

export const STUDY_ABROAD_MAX_SCORE = 150;

export type StudyAbroadTopicScoreMap = Record<StudyAbroadTopic, number>;
export type StudyAbroadTopicAnsweredMap = Record<StudyAbroadTopic, number>;

export interface StudyAbroadEvaluationResult {
  assessmentCode: "STUDY_ABROAD";
  overallScore: number;
  overallPercentage: number;
  band: string;
  topicScores: StudyAbroadTopicScoreMap;
  topicAnswered: StudyAbroadTopicAnsweredMap;
  answeredCount: number;
  totalQuestions: number;
}

function createEmptyTopicMap<T>(initial: T): Record<StudyAbroadTopic, T> {
  return STUDY_ABROAD_TOPICS.reduce((acc, topic) => {
    acc[topic] = initial;
    return acc;
  }, {} as Record<StudyAbroadTopic, T>);
}

export function scoreToPercentage(score: number): number {
  return Math.max(0, Math.min(100, Math.round((score / STUDY_ABROAD_MAX_SCORE) * 100)));
}

export function bandFromPercentage(percentage: number): string {
  if (percentage > 90) return "Completely Ready";
  if (percentage >= 76) return "Almost Ready";
  if (percentage >= 51) return "Moderately Ready";
  if (percentage >= 26) return "Partially Ready";
  return "At Risk";
}

export function bandFromScore(score: number): string {
  return bandFromPercentage(scoreToPercentage(score));
}

export function evaluateStudyAbroadAnswers(
  attempt: IStudentAssessmentAttempt
): StudyAbroadEvaluationResult {
  const topicRaw = createEmptyTopicMap(0);
  const topicCount = createEmptyTopicMap(0);

  for (const question of attempt.questions) {
    if (!question.answer) continue;

    const topic = String(question.category || "") as StudyAbroadTopic;
    if (!STUDY_ABROAD_TOPICS.includes(topic)) continue;

    const selected = (question.options || []).find((opt) => opt.label === question.answer);
    const score = Number(selected?.score);
    if (!Number.isFinite(score)) continue;

    topicRaw[topic] += score;
    topicCount[topic] += 1;
  }

  const topicScores = createEmptyTopicMap(0);
  STUDY_ABROAD_TOPICS.forEach((topic) => {
    const count = topicCount[topic];
    topicScores[topic] = count > 0
      ? Math.round((topicRaw[topic] / (count * 3)) * 100)
      : 0;
  });

  const answeredCount = attempt.questions.filter((q) => q.answer).length;
  const overallScore = attempt.questions.reduce((sum, question) => {
    if (!question.answer) return sum;
    const selected = (question.options || []).find((opt) => opt.label === question.answer);
    const score = Number(selected?.score);
    return sum + (Number.isFinite(score) ? score : 0);
  }, 0);

  const overallPercentage = scoreToPercentage(overallScore);
  const band = bandFromScore(overallScore);

  return {
    assessmentCode: "STUDY_ABROAD",
    overallScore,
    overallPercentage,
    band,
    topicScores,
    topicAnswered: topicCount,
    answeredCount,
    totalQuestions: attempt.totalQuestions,
  };
}
