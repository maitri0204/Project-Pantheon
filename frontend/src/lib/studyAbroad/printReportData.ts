import { apiRequest } from "@/lib/api";
import {
  mapStudyAbroadEvaluationToResult,
  type AssessmentResult,
  type Topic,
} from "@/lib/studyAbroad/assessmentData";

type StudyAbroadEvaluationPayload = {
  overallScore: number;
  band?: string;
  topicScores: Record<string, number>;
  topicAnswered?: Record<string, number>;
  answeredCount?: number;
  totalQuestions?: number;
};

type ReportResponse = {
  report: {
    attemptId: string;
    assessmentCode: string;
    submittedAt?: string;
    evaluation: StudyAbroadEvaluationPayload;
    student?: {
      firstName?: string;
      lastName?: string;
      city?: string;
      country?: string;
      state?: string;
      email?: string;
    };
  };
};

type AttemptListResponse = {
  attempts: Array<{
    attemptId: string;
    completedAt?: string;
    evaluation?: StudyAbroadEvaluationPayload;
  }>;
};

export type StudyAbroadPrintContext = {
  result: AssessmentResult;
  history: AssessmentResult[];
  studentName: string;
  profile: {
    fullName: string;
    email: string;
    mobile: string;
    country: string;
    state: string;
    city: string;
  } | null;
};

export async function fetchStudyAbroadPrintContext(
  token: string,
  attemptId: string,
): Promise<StudyAbroadPrintContext> {
  const [reportRes, attemptsRes] = await Promise.all([
    apiRequest<ReportResponse>(`/platform/student/attempts/${attemptId}/report`, {}, token),
    apiRequest<AttemptListResponse>("/platform/student/assessments/STUDY_ABROAD/attempts", {}, token),
  ]);

  const report = reportRes.report;
  const submittedAt = report.submittedAt ?? new Date().toISOString();

  const result = mapStudyAbroadEvaluationToResult(
    report.attemptId,
    submittedAt,
    report.evaluation,
  );

  const history = (attemptsRes.attempts ?? [])
    .filter((item) => item.evaluation)
    .map((item) =>
      mapStudyAbroadEvaluationToResult(
        item.attemptId,
        item.completedAt ?? submittedAt,
        item.evaluation as StudyAbroadEvaluationPayload,
      ),
    );

  const student = report.student;
  const studentName =
    [student?.firstName, student?.lastName].filter(Boolean).join(" ").trim() || "Student";

  return {
    result,
    history,
    studentName,
    profile: student
      ? {
          fullName: studentName,
          email: student.email ?? "",
          mobile: "",
          country: student.country ?? "",
          state: student.state ?? "",
          city: student.city ?? "",
        }
      : null,
  };
}

export function studyAbroadEvaluationFromReport(
  evaluation: Record<string, unknown>,
  report: { answeredCount: number; totalQuestions: number },
): StudyAbroadEvaluationPayload & { topicScores: Record<Topic, number> } {
  const topicScores = evaluation.topicScores as Record<string, number> | undefined;
  return {
    overallScore: Number(evaluation.overallScore ?? 0),
    band: String(evaluation.band ?? ""),
    topicScores: (topicScores ?? {}) as Record<Topic, number>,
    topicAnswered: evaluation.topicAnswered as Record<Topic, number> | undefined,
    answeredCount: Number(evaluation.answeredCount ?? report.answeredCount),
    totalQuestions: Number(evaluation.totalQuestions ?? report.totalQuestions),
  };
}
