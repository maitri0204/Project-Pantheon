import { grade8Questions } from "./grade8Questions";
import { grade9Questions } from "./grade9Questions";
import { grade10Questions } from "./grade10Questions";

export interface AcademicCareerQuestion {
  questionNumber: number;
  grade: "Grade 8" | "Grade 9" | "Grade 10";
  situation: string;
  questionText: string;
  options: Array<{
    optionKey: "A" | "B" | "C" | "D" | "E";
    optionText: string;
    interestCode: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";
  }>;
}

export const GRADE_8_QUESTIONS: AcademicCareerQuestion[] = grade8Questions;
export const GRADE_9_QUESTIONS: AcademicCareerQuestion[] = grade9Questions;
export const GRADE_10_QUESTIONS: AcademicCareerQuestion[] = grade10Questions;

export const ALL_ACADEMIC_CAREER_QUESTIONS = [
  { grade: "Grade 8", questions: GRADE_8_QUESTIONS },
  { grade: "Grade 9", questions: GRADE_9_QUESTIONS },
  { grade: "Grade 10", questions: GRADE_10_QUESTIONS },
];
