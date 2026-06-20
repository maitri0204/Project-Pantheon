import { apiRequest } from "@/lib/api";
import {
  mapStudyAbroadEvaluationToResult,
  normalizeTopicScores,
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

export function resolveStudyAbroadApiPaths(reportFetchPath: string): {
  reportPath: string;
  attemptsPath: string;
} {
  const studentAdminMatch = reportFetchPath.match(
    /^\/platform\/students\/([^/]+)\/attempts\/[^/]+\/report$/,
  );
  if (studentAdminMatch) {
    const studentId = studentAdminMatch[1];
    return {
      reportPath: reportFetchPath,
      attemptsPath: `/platform/students/${studentId}/assessments/STUDY_ABROAD/attempts`,
    };
  }

  const parentAdminMatch = reportFetchPath.match(
    /^\/platform\/parents\/([^/]+)\/attempts\/[^/]+\/report$/,
  );
  if (parentAdminMatch) {
    const parentId = parentAdminMatch[1];
    return {
      reportPath: reportFetchPath,
      attemptsPath: `/platform/parents/${parentId}/assessments/STUDY_ABROAD/attempts`,
    };
  }

  const studentMatch = reportFetchPath.match(/^\/platform\/student\/attempts\/([^/]+)\/report$/);
  if (studentMatch) {
    return {
      reportPath: reportFetchPath,
      attemptsPath: "/platform/student/assessments/STUDY_ABROAD/attempts",
    };
  }

  return {
    reportPath: reportFetchPath,
    attemptsPath: "/platform/student/assessments/STUDY_ABROAD/attempts",
  };
}

export async function fetchStudyAbroadPrintContext(
  attemptId: string,
  reportFetchPath?: string,
): Promise<StudyAbroadPrintContext> {
  const { reportPath, attemptsPath } = resolveStudyAbroadApiPaths(
    reportFetchPath || `/platform/student/attempts/${attemptId}/report`,
  );

  const [reportRes, attemptsRes] = await Promise.all([
    apiRequest<ReportResponse>(reportPath, {}),
    apiRequest<AttemptListResponse>(attemptsPath, {}).catch(() => ({ attempts: [] })),
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
    history: history.length > 0 ? history : [result],
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
  return {
    overallScore: Number(evaluation.overallScore ?? 0),
    band: String(evaluation.band ?? ""),
    topicScores: normalizeTopicScores(
      evaluation.topicScores as Record<string, number> | undefined,
    ),
    topicAnswered: evaluation.topicAnswered as Record<Topic, number> | undefined,
    answeredCount: Number(evaluation.answeredCount ?? report.answeredCount),
    totalQuestions: Number(evaluation.totalQuestions ?? report.totalQuestions),
  };
}
