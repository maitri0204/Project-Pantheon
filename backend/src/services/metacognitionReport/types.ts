export interface DomainScore {
  id: string;
  name: string;
  score: number;
  max: number;
  percentage: number;
}

export interface AssessmentData {
  student: {
    name: string;
    grade: string;
    school: string;
    assessmentDate: string;
    counselor: string;
  };
  overall: {
    score: number;
    maxScore: number;
    percentage: number;
  };
  domains: DomainScore[];
  quadrant: {
    type: string;
    knowledge: number;
    regulation: number;
  };
  learnerType: string;
}
