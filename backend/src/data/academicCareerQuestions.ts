// Comprehensive Academic Career & Interest Test Question Bank
// Exported from: Academic-career-and-interest-test project
// Format: 180 questions across 3 grades (60 per grade)

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

const Q_TEXT = "At this stage, you would most like to:";

/**
 * Grade 8 Questions (60 total)
 * Ages 13-14, exploring foundational interest areas
 */
export const GRADE_8_QUESTIONS: AcademicCareerQuestion[] = [
  // Q1-Q60 placeholder - these should be imported from the actual Academic test files
  // For production use, the complete 60 questions from grade8Questions.ts should be included here
  // This structure shows how they would be formatted

  {
    questionNumber: 1,
    grade: "Grade 8",
    situation:
      "In a class activity, your school announces an inter-school exhibition and asks students to choose one project area.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "work with formulas, patterns and evidence", interestCode: "A" },
      { optionKey: "B", optionText: "analyse profit, pricing and value", interestCode: "B" },
      { optionKey: "C", optionText: "design visuals, stories or creative material", interestCode: "D" },
      { optionKey: "D", optionText: "use digital tools, apps or automation", interestCode: "E" },
      { optionKey: "E", optionText: "take responsibility for goals and execution", interestCode: "H" },
    ],
  },
  // Additional 59 Grade 8 questions would continue here...
];

/**
 * Grade 9 Questions (60 total)
 * Ages 14-15, deepening interest exploration before stream selection
 */
export const GRADE_9_QUESTIONS: AcademicCareerQuestion[] = [
  // Q1-Q60 Grade 9 questions would be imported from grade9Questions.ts
  // Same structure as Grade 8

  {
    questionNumber: 1,
    grade: "Grade 9",
    situation: "During a project selection, you can choose any subject-based interest project.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "conduct scientific research and analysis", interestCode: "A" },
      { optionKey: "B", optionText: "create an economic development plan", interestCode: "B" },
      { optionKey: "C", optionText: "document social governance issues", interestCode: "C" },
      { optionKey: "D", optionText: "design visual communication materials", interestCode: "D" },
      { optionKey: "E", optionText: "develop an innovative tech solution", interestCode: "E" },
    ],
  },
  // Additional 59 Grade 9 questions would continue here...
];

/**
 * Grade 10 Questions (60 total)
 * Ages 15-16, final critical assessment before stream and subject selection
 */
export const GRADE_10_QUESTIONS: AcademicCareerQuestion[] = [
  // Q1-Q60 Grade 10 questions would be imported from grade10Questions.ts
  // Same structure as earlier grades, but more advanced

  {
    questionNumber: 1,
    grade: "Grade 10",
    situation: "Before choosing your stream for Grade 11, you evaluate your readiness and interests.",
    questionText: Q_TEXT,
    options: [
      { optionKey: "A", optionText: "pursue theoretical and experimental science", interestCode: "A" },
      { optionKey: "B", optionText: "study financial systems and economics", interestCode: "B" },
      { optionKey: "C", optionText: "understand society, law, and governance", interestCode: "C" },
      { optionKey: "D", optionText: "explore creative expression and design", interestCode: "D" },
      { optionKey: "E", optionText: "build technology solutions and systems", interestCode: "E" },
    ],
  },
  // Additional 59 Grade 10 questions would continue here...
];

/**
 * Combined export for easy seeding
 * Use this structure to import all questions at once
 */
export const ALL_ACADEMIC_CAREER_QUESTIONS = [
  { grade: "Grade 8", questions: GRADE_8_QUESTIONS },
  { grade: "Grade 9", questions: GRADE_9_QUESTIONS },
  { grade: "Grade 10", questions: GRADE_10_QUESTIONS },
];

// IMPORTANT: In production, these should be populated by importing the actual data files:
// import { grade8Questions } from '../../../Academic-career-and-interest-test/backend/src/data/grade8Questions';
// import { grade9Questions } from '../../../Academic-career-and-interest-test/backend/src/data/grade9Questions';
// import { grade10Questions } from '../../../Academic-career-and-interest-test/backend/src/data/grade10Questions';
//
// Then export as:
// export const GRADE_8_QUESTIONS = grade8Questions;
// export const GRADE_9_QUESTIONS = grade9Questions;
// export const GRADE_10_QUESTIONS = grade10Questions;
