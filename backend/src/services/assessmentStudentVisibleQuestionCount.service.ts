import Question from "../models/Question";
import { buildCareerDnaQuestionSetForAttempt } from "./careerDnaQuestionSelection.service";

const RESILIENCE_ASSESSMENT_CODE = "RESILIENCE_TEST";
const LEGACY_RESILIENCE_CODES = new Set(["ADVERSITY_TEST", "RQ_TEST", "RESILIENCE"]);

export const normalizeAssessmentCodeForVisibleCount = (code: string): string => {
  const normalized = code.toUpperCase().trim();
  if (normalized === "METACOGNITION") return "METACOGNITION_TEST";
  if (normalized === "JOHARI" || normalized === "CLEAR") return "JOHARI_WINDOW";
  if (normalized === "LITMUS") return "LITMUS_TEST";
  if (LEGACY_RESILIENCE_CODES.has(normalized)) return RESILIENCE_ASSESSMENT_CODE;
  return normalized;
};

const getAssessmentCodeAliases = (code: string): string[] => {
  const normalized = normalizeAssessmentCodeForVisibleCount(code);
  if (normalized === "METACOGNITION_TEST") return ["METACOGNITION_TEST", "METACOGNITION"];
  if (normalized === "JOHARI_WINDOW") return ["JOHARI_WINDOW", "JOHARI", "CLEAR"];
  if (normalized === "LITMUS_TEST") return ["LITMUS_TEST", "LITMUS"];
  if (normalized === RESILIENCE_ASSESSMENT_CODE) return [RESILIENCE_ASSESSMENT_CODE, "ADVERSITY_TEST"];
  return [normalized];
};

/** Fixed per-attempt counts where selection logic does not depend on bank size. */
const FIXED_STUDENT_VISIBLE_COUNTS: Record<string, number> = {
  ACADEMIC_CAREER: 60,
  STUDY_ABROAD: 50,
};

async function computeCareerDnaVisibleCount(): Promise<number> {
  const questions = await Question.find({
    assessmentCode: "CAREER_DNA",
    isActive: true,
  })
    .select("category questionNumber")
    .lean();

  if (!questions.length) {
    return 0;
  }

  return buildCareerDnaQuestionSetForAttempt(
    questions.map((question) => ({
      category: String(question.category || ""),
      questionNumber: Number(question.questionNumber || 0),
    })),
  ).length;
}

export async function getStudentVisibleQuestionCount(
  code: string,
  totalCount: number,
): Promise<number> {
  const normalized = normalizeAssessmentCodeForVisibleCount(code);
  const fixed = FIXED_STUDENT_VISIBLE_COUNTS[normalized];
  if (fixed != null) {
    return fixed;
  }

  if (normalized === "CAREER_DNA") {
    return computeCareerDnaVisibleCount();
  }

  return totalCount;
}

export async function aggregateStudentVisibleQuestionCounts(
  assessments: Array<{ code: string }>,
  totalCounts: Map<string, number>,
): Promise<Map<string, number>> {
  const visibleCounts = new Map<string, number>();
  const careerDnaNeeded = assessments.some(
    (assessment) => normalizeAssessmentCodeForVisibleCount(assessment.code) === "CAREER_DNA",
  );
  const careerDnaVisible = careerDnaNeeded ? await computeCareerDnaVisibleCount() : 0;

  for (const assessment of assessments) {
    const canonical = normalizeAssessmentCodeForVisibleCount(assessment.code);
    const total = totalCounts.get(canonical) || 0;
    const fixed = FIXED_STUDENT_VISIBLE_COUNTS[canonical];

    if (fixed != null) {
      visibleCounts.set(canonical, fixed);
      continue;
    }

    if (canonical === "CAREER_DNA") {
      visibleCounts.set(canonical, careerDnaVisible);
      continue;
    }

    visibleCounts.set(canonical, total);
  }

  return visibleCounts;
}

export { getAssessmentCodeAliases };
