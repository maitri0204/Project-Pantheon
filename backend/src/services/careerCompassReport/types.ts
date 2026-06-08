export interface CareerCompassDimensionSlice {
  label: string;
  traitA: string;
  traitB: string;
  percentA: number;
  percentB: number;
}

export interface CareerCompassAssessmentData {
  student: {
    name: string;
    grade: string;
    institute: string;
    assessmentDate: string;
    counselor: string;
  };
  personalityType: string;
  personalityCode: string;
  description: string;
  dimensions: {
    energy: CareerCompassDimensionSlice;
    cognitive: CareerCompassDimensionSlice;
    decision: CareerCompassDimensionSlice;
    working: CareerCompassDimensionSlice;
  };
  suggestedStream: string;
  suggestedSubjects: string[];
  recommendedCareers: string[];
  careerReadinessScore: number;
  strongestTrait: string;
}
