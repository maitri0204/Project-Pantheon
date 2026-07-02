export type LandingAssessment = {
  code: string;
  name: string;
  shortName: string;
  emoji: string;
  accentClass: string;
  audience: string;
  duration: string;
  highlights: string[];
  description: string;
};

/** Public catalog of assessments available on the platform (marketing copy for landing page). */
export const LANDING_ASSESSMENTS: LandingAssessment[] = [
  {
    code: "CAREER_COMPASS",
    name: "Career Compass",
    shortName: "Career Compass",
    emoji: "🧭",
    accentClass: "from-blue-500 via-indigo-500 to-violet-500",
    audience: "Students",
    duration: "15-20 min",
    highlights: ["Personality mapping", "Career direction insights", "Detailed PDF report"],
    description:
      "Discover how your personality shapes learning style, strengths, and career fit with a science-backed personality profile.",
  },
  {
    code: "LITMUS_TEST",
    name: "Litmus Test",
    shortName: "Litmus Test",
    emoji: "⚗️",
    accentClass: "from-violet-500 via-purple-500 to-fuchsia-500",
    audience: "Parents",
    duration: "10-15 min",
    highlights: ["Parenting style profile", "K·S·E·P·J scoring", "Family guidance report"],
    description:
      "Understand your parenting approach and how it influences your child's motivation, discipline, and emotional growth.",
  },
  {
    code: "CAREER_DNA",
    name: "Career DNA Profiler",
    shortName: "Career DNA",
    emoji: "🧬",
    accentClass: "from-teal-500 via-cyan-500 to-sky-500",
    audience: "Students",
    duration: "45-60 min",
    highlights: ["Multi-section profiling", "Capability breakdown", "Executive career report"],
    description:
      "A deep, multi-dimensional career profiler that maps aptitudes, interests, and work-style preferences across several domains.",
  },
  {
    code: "METACOGNITION_TEST",
    name: "Thinking & Expression Skills Test",
    shortName: "TEST",
    emoji: "🧠",
    accentClass: "from-amber-500 via-orange-500 to-rose-500",
    audience: "Students & Parents",
    duration: "20-25 min",
    highlights: ["Metacognition domains", "Learning strategy insights", "Quadrant-based report"],
    description:
      "Measure how you think, plan, regulate, and express ideas - essential skills for academic success and confident communication.",
  },
  {
    code: "JOHARI_WINDOW",
    name: "CLEAR - Cognitive Lens for Emotional Awareness & Reflection",
    shortName: "CLEAR",
    emoji: "🪟",
    accentClass: "from-rose-500 via-pink-500 to-fuchsia-500",
    audience: "Students",
    duration: "12-18 min",
    highlights: ["Johari quadrant analysis", "Self-awareness mapping", "Growth-focused report"],
    description:
      "Reveal blind spots and hidden strengths through a structured self-awareness assessment built on the Johari Window framework.",
  },
  {
    code: "RESILIENCE_TEST",
    name: "Resilience Quotient (RQ) Assessment",
    shortName: "RQ",
    emoji: "💪",
    accentClass: "from-emerald-500 via-green-500 to-teal-500",
    audience: "Students",
    duration: "15-20 min",
    highlights: ["CORE resilience model", "4-dimension scoring", "30-day action plan"],
    description:
      "Evaluate how you respond to setbacks across Control, Ownership, Reach, and Endurance - with a premium resilience report.",
  },
  {
    code: "ACADEMIC_CAREER",
    name: "Academic Career & Interest Test",
    shortName: "Academic Career",
    emoji: "🎓",
    accentClass: "from-sky-500 via-blue-500 to-cyan-500",
    audience: "Grades 8-10",
    duration: "25-35 min",
    highlights: ["10 interest codes", "Stream recommendations", "Grade-calibrated guidance"],
    description:
      "Map academic interests and explore career pathways aligned with your strengths - ideal for stream selection and subject planning.",
  },
  {
    code: "STUDY_ABROAD",
    name: "Study Abroad Readiness Assessment",
    shortName: "Study Abroad",
    emoji: "✈️",
    accentClass: "from-indigo-500 via-blue-500 to-sky-500",
    audience: "Students",
    duration: "60 min",
    highlights: ["12 readiness dimensions", "Premium multi-page report", "Roadmap & counselor notes"],
    description:
      "Measure readiness across language, academics, finances, visa, culture, and more - with a comprehensive study-abroad action plan.",
  },
  {
    code: "EMPLOYABILITY_QUOTIENT",
    name: "Employability Quotient",
    shortName: "Employability Quotient",
    emoji: "💼",
    accentClass: "from-emerald-500 via-teal-500 to-cyan-500",
    audience: "Students",
    duration: "45-60 min",
    highlights: ["10 future-skills dimensions", "Scenario-based MCQs", "Performance tier report"],
    description:
      "Measure employability readiness across analytical thinking, resilience, leadership, creativity, motivation, technology, empathy, curiosity, talent management, and service orientation.",
  },
];

export const LANDING_STATS = [
  { value: "09", label: "Expert Assessments" },
  { value: "15+", label: "Pages of Insightful Report" },
  { value: "52", label: "Readiness Dimensions Measured" },
];
