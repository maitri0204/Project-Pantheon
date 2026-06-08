export type LitmusStyleKey = "King" | "Servant" | "Elder" | "Prince" | "Joker";

export interface LitmusAssessmentData {
  parentName: string;
  assessmentDate: string;
  overallScore: number;
  maxScore: number;
  primaryStyle: LitmusStyleKey;
  secondaryStyle: LitmusStyleKey;
  scores: Record<LitmusStyleKey, number>;
  maxStyleScore: number;
}
