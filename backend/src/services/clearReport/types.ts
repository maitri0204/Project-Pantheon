import { assessmentData } from "./templateAssessmentData";

export type ClearAssessmentData = typeof assessmentData;
export type ClearPlanMonth = ClearAssessmentData["plan90Days"]["months"][number];
