import { AssessmentData, DomainScore } from "./types";

export function getStrongestDomain(data: AssessmentData): DomainScore {
  return data.domains.reduce((a, b) => (a.percentage > b.percentage ? a : b));
}

export function getWeakestDomain(data: AssessmentData): DomainScore {
  return data.domains.reduce((a, b) => (a.percentage < b.percentage ? a : b));
}
