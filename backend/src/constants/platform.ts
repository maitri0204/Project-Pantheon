export const DEFAULT_SUPERADMIN_EMAIL = "maitripatel2608@gmail.com";
export const DEFAULT_SUPERADMIN_NAME = "Maitri Patel";
export const REVIEWER_EMAIL = "reviewer@admitra.io";
export const REVIEWER_NAME = "Reviewer";
export const PLATFORM_ORG_SLUG = "project-pantheon";
export const PLATFORM_ORG_NAME = "Assessment Centre";

export type AssessmentSeedDefinition = {
  code: string;
  slug: string;
  name: string;
  category: string;
  summary: string;
  sourceProject: string;
  sourceDbName: string;
  seedCommands: string[];
  evaluationReference: string;
  reportReference: string;
  invoiceReference: string;
  loginReference: string;
  questionBankStatus: "linked" | "pending-import" | "imported";
  questionCount: number;
  basePrice: number;
  tags: string[];
};

export const DEFAULT_ASSESSMENTS: AssessmentSeedDefinition[] = [
  {
    code: "CAREER_COMPASS",
    slug: "career-compass",
    name: "Career Compass",
    category: "personality",
    summary: "Personality assessment for students.",
    sourceProject: "Project-Career_Compass",
    sourceDbName: "career_compass",
    seedCommands: ["npm run seed:personality"],
    evaluationReference: "backend/src/controllers/testController.ts#computePersonality",
    reportReference: "frontend personality result view + backend sendReportToStudent",
    invoiceReference: "Project-Centralized_System payment/invoice flow",
    loginReference: "OTP + math captcha auth flow",
    questionBankStatus: "linked",
    questionCount: 70,
    basePrice: 499,
    tags: ["personality", "mbti", "student"],
  },
  {
    code: "LITMUS_TEST",
    slug: "litmus-test",
    name: "Litmus Test",
    category: "parental-style",
    summary: "Parent-oriented assessment with K, S, E, P, J style scoring.",
    sourceProject: "Project-Litmus_Test",
    sourceDbName: "litmus_test",
    seedCommands: [],
    evaluationReference: "backend/src/controllers/testController.ts#submitTest",
    reportReference: "backend/src/controllers/reportController.ts + PDF upload flow",
    invoiceReference: "Project-Centralized_System payment/invoice flow",
    loginReference: "OTP-based parent login",
    questionBankStatus: "linked",
    questionCount: 25,
    basePrice: 599,
    tags: ["parent", "style", "litmus"],
  },
  {
    code: "CAREER_DNA",
    slug: "career-dna",
    name: "Career DNA Profiler",
    category: "multi-assessment",
    summary: "Multi-section career profiling assessment with service-based sections.",
    sourceProject: "Project-Career_DNA",
    sourceDbName: "career_dna_profiler",
    seedCommands: ["npm run seed:all"],
    evaluationReference: "backend/src/controllers/testController.ts#computeBreakdown",
    reportReference: "service-based result breakdown and student report flow",
    invoiceReference: "frontend/src/lib/generateInvoice.ts + centralized payment flow",
    loginReference: "OTP + math captcha auth flow",
    questionBankStatus: "linked",
    questionCount: 0,
    basePrice: 1499,
    tags: ["career", "multi-section", "student"],
  },
  {
    code: "METACOGNITION_TEST",
    slug: "metacognition-test",
    name: "TEST - Thinking & Expression Skills Test",
    category: "test",
    summary: "Domain-based assessment for students and parents.",
    sourceProject: "Project-Metacognition_Test",
    sourceDbName: "metacognition_test",
    seedCommands: [],
    evaluationReference: "backend/src/controllers/testController.ts#submitTest",
    reportReference: "result pages and emailed report PDF flow",
    invoiceReference: "Project-Centralized_System payment/invoice flow",
    loginReference: "OTP-based role login",
    questionBankStatus: "linked",
    questionCount: 0,
    basePrice: 699,
    tags: ["metacognition", "student", "parent"],
  },
  {
    code: "JOHARI_WINDOW",
    slug: "johari-window",
    name: "CLEAR - Cognitive Lens for Emotional Awareness & Reflection",
    category: "self-awareness",
    summary: "Self-awareness assessment using quadrant scoring.",
    sourceProject: "Project-Johari_Window",
    sourceDbName: "johari_window",
    seedCommands: ["npm run seed"],
    evaluationReference: "backend/src/controllers/testController.ts#computeJohariScores",
    reportReference: "result breakdown with quadrant analysis",
    invoiceReference: "Project-Centralized_System payment/invoice flow",
    loginReference: "OTP-based login flow",
    questionBankStatus: "linked",
    questionCount: 20,
    basePrice: 549,
    tags: ["johari", "feedback", "self-awareness"],
  },
  {
    code: "RESILIENCE_TEST",
    slug: "resilience-quotient",
    name: "Resilience Quotient (RQ) Assessment",
    category: "resilience",
    summary: "Measure your resilience and adaptability to challenges with the RQ Assessment. Evaluate Control, Ownership, Reach, and Endurance dimensions.",
    sourceProject: "Adversity-Test",
    sourceDbName: "adversity_test",
    seedCommands: [],
    evaluationReference: "backend/src/services/aqScoring.service.ts#evaluateAQAnswers",
    reportReference: "backend/src/lib/generateAQReport.ts + subscale breakdown",
    invoiceReference: "Project-Centralized_System payment/invoice flow",
    loginReference: "OTP + math captcha auth flow",
    questionBankStatus: "linked",
    questionCount: 30,
    basePrice: 799,
    tags: ["resilience", "rq", "student"],
  },
  {
    code: "ACADEMIC_CAREER",
    slug: "academic-career-interest",
    name: "Academic Career & Interest Test",
    category: "career-interest",
    summary: "Discover your academic interests and explore career pathways aligned with your strengths. Get personalized recommendations across 10 interest codes.",
    sourceProject: "Academic-career-and-interest-test",
    sourceDbName: "academic_career_interest",
    seedCommands: ["npm run seed:academic-career"],
    evaluationReference: "backend/src/services/academicCareerScoring.service.ts#calculateInterestScores",
    reportReference: "frontend onscreen report + PDF generator with career recommendations",
    invoiceReference: "Project-Centralized_System payment/invoice flow",
    loginReference: "OTP + math captcha auth flow",
    questionBankStatus: "imported",
    questionCount: 180,
    basePrice: 599,
    tags: ["career", "interest", "student", "academic-career"],
  },
  {
    code: "STUDY_ABROAD",
    slug: "study-abroad-readiness",
    name: "Study Abroad Readiness Assessment",
    category: "study-abroad",
    summary: "Measure readiness across 12 dimensions for studying abroad — language, academics, finances, visa, culture, and more.",
    sourceProject: "Study-Abroad",
    sourceDbName: "study_abroad",
    seedCommands: ["npm run seed:study-abroad"],
    evaluationReference: "backend/src/services/studyAbroadScoring.service.ts#evaluateStudyAbroadAnswers",
    reportReference: "frontend StudyAbroadReport + StudyAbroadResultPdfDocument",
    invoiceReference: "Project-Centralized_System payment/invoice flow",
    loginReference: "OTP + math captcha auth flow",
    questionBankStatus: "imported",
    questionCount: 150,
    basePrice: 699,
    tags: ["study-abroad", "readiness", "student"],
  },
];
