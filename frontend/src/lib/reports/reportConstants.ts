// Shared personality type constants used across the application

export const DOMAIN_INFO: Record<
  number,
  { name: string; shortName: string; color: string; bg: string; maxScore: number }
> = {
  1: { name: "Awareness", shortName: "Awareness", color: "#3b82f6", bg: "bg-blue-50", maxScore: 50 },
  2: { name: "Planning", shortName: "Planning", color: "#8b5cf6", bg: "bg-purple-50", maxScore: 50 },
  3: { name: "Monitoring", shortName: "Monitoring", color: "#10b981", bg: "bg-green-50", maxScore: 50 },
  4: { name: "Regulation", shortName: "Regulation", color: "#f97316", bg: "bg-orange-50", maxScore: 40 },
  5: { name: "Reflection", shortName: "Reflection", color: "#ec4899", bg: "bg-pink-50", maxScore: 10 },
};

export const KNOWLEDGE_MAX = DOMAIN_INFO[1].maxScore;
export const REGULATION_MAX =
  DOMAIN_INFO[2].maxScore + DOMAIN_INFO[3].maxScore + DOMAIN_INFO[4].maxScore + DOMAIN_INFO[5].maxScore;

export const QUADRANT_LABELS = {
  expertLearner: "Self-Regulated Learner",
  reflectiveLearner: "Reflective Learner",
  unawareLearner: "Passive Learner",
  strategicLearner: "Strategic Learner",
} as const;

export type QuadrantType = (typeof QUADRANT_LABELS)[keyof typeof QUADRANT_LABELS];

export function getQuadrantLabel(knowledgePct: number, regulationPct: number): QuadrantType {
  if (knowledgePct >= 50 && regulationPct >= 50) return QUADRANT_LABELS.expertLearner;
  if (knowledgePct < 50 && regulationPct >= 50) return QUADRANT_LABELS.reflectiveLearner;
  if (knowledgePct < 50 && regulationPct < 50) return QUADRANT_LABELS.unawareLearner;
  return QUADRANT_LABELS.strategicLearner;
}

export const PERSONALITY_NAMES: Record<string, string> = {
  ISTJ: "The Systematic Organizer",
  ISFJ: "The Protective Supporter",
  INFJ: "The Purpose Driven Guide",
  INTJ: "The Master Strategist",
  ISTP: "The Practical Problem Solver",
  ISFP: "The Artist",
  INFP: "The Value Creator",
  INTP: "The Curious",
  ESTP: "The Action Taker",
  ESFP: "The Joyful Performer",
  ENFP: "The Visionary",
  ENTP: "The Entrepreneur",
  ESTJ: "The Strategic Leader",
  ESFJ: "The Community Builder",
  ENFJ: "The Mentor Leader",
  ENTJ: "The Visionary Director",
};

export const PERSONALITY_CAREERS: Record<string, string[]> = {
  ISTJ: ["Chartered Accountant", "Auditor", "Financial Analyst", "Banking Officer", "Data Analyst", "Civil Engineer", "Operations Manager", "Risk Manager", "Compliance Officer", "Government Officer"],
  ISFJ: ["Nurse", "Teacher", "Counselor", "Physiotherapist", "Social Worker", "Occupational Therapist", "Child Development Specialist", "Healthcare Administrator", "Dietitian", "Community Service Manager"],
  INFJ: ["Psychologist", "Counselor", "Author", "Policy Analyst", "Social Entrepreneur", "Human Rights Advocate", "Professor", "NGO Director", "Diplomat", "Life Coach"],
  INTJ: ["Data Scientist", "AI Engineer", "Software Architect", "Investment Strategist", "Research Scientist", "Economist", "Systems Engineer", "Policy Strategist", "Management Consultant", "Cybersecurity Expert"],
  ISTP: ["Mechanical Engineer", "Robotics Engineer", "Pilot", "Automotive Engineer", "Aerospace Engineer", "Drone Operator", "Industrial Technician", "Cybersecurity Specialist", "Systems Engineer", "Technical Consultant"],
  ISFP: ["Graphic Designer", "Fashion Designer", "Photographer", "Animator", "Interior Designer", "Illustrator", "Film Editor", "Art Director", "Product Designer", "Game Artist"],
  INFP: ["Writer", "Screenwriter", "Psychologist", "Creative Director", "Social Worker", "Journalist", "Editor", "Content Strategist", "Therapist", "NGO Program Manager"],
  INTP: ["Research Scientist", "AI Researcher", "Software Developer", "Mathematician", "Data Scientist", "Game Developer", "Philosopher", "Economist", "Systems Architect", "Machine Learning Engineer"],
  ESTP: ["Entrepreneur", "Stock Trader", "Sales Manager", "Business Development Manager", "Event Manager", "Sports Manager", "Operations Manager", "Real Estate Consultant", "Marketing Executive", "Logistics Manager"],
  ESFP: ["Actor", "Event Host", "Public Relations Specialist", "Hospitality Manager", "Influencer", "Travel Consultant", "Brand Promoter", "Media Presenter", "Content Creator", "Tourism Manager"],
  ENFP: ["Marketing Manager", "Brand Strategist", "Startup Founder", "Creative Director", "Journalist", "Advertising Specialist", "Public Speaker", "HR Trainer", "Content Creator", "Social Media Strategist"],
  ENTP: ["Startup Founder", "Product Manager", "Innovation Consultant", "Venture Capital Analyst", "Business Strategist", "Technology Entrepreneur", "Marketing Strategist", "Digital Product Designer", "Management Consultant", "Business Analyst"],
  ESTJ: ["Business Manager", "Corporate Executive", "Chartered Accountant", "Project Manager", "Banking Manager", "Operations Director", "Government Officer", "Supply Chain Manager", "Retail Director", "Finance Manager"],
  ESFJ: ["HR Manager", "Teacher", "Event Planner", "Hospitality Manager", "Community Relations Manager", "School Counselor", "Public Relations Manager", "Training Manager", "Social Worker", "Customer Experience Manager"],
  ENFJ: ["Teacher", "Leadership Coach", "HR Director", "NGO Leader", "Counselor", "Public Speaker", "Social Entrepreneur", "Policy Advocate", "Training Consultant", "Corporate Coach"],
  ENTJ: ["CEO", "Investment Banker", "Management Consultant", "Strategy Director", "Entrepreneur", "Venture Capitalist", "Corporate Lawyer", "Business Analyst", "Finance Director", "Policy Advisor"],
};

export const LETTER_CODES: Record<string, string> = {
  E: "SO", I: "RO", S: "PO", N: "CT",
  T: "LD", F: "VD", J: "SW", P: "FW",
};

export const LETTER_NAMES: Record<string, string> = {
  E: "Social Orientation",
  I: "Reflective Orientation",
  S: "Practical Observation",
  N: "Conceptual Thinking",
  T: "Logical Decision Style",
  F: "Value-Based Decision Style",
  J: "Structured Working Style",
  P: "Flexible Working Style",
};

export const DIMENSION_COLORS: Record<string, { a: string; b: string }> = {
  "E/I": { a: "#6c5ce7", b: "#00b894" },
  "S/N": { a: "#e17055", b: "#0984e3" },
  "T/F": { a: "#fdcb6e", b: "#e84393" },
  "J/P": { a: "#00cec9", b: "#d63031" },
};

export const DIMENSION_STYLES: Record<string, string> = {
  "E/I": "Energy Style",
  "S/N": "Cognitive Style",
  "T/F": "Values Style",
  "J/P": "Life Style",
};

export const PERSONALITY_STREAMS: Record<string, string> = {
  ISTJ: "Commerce / Science",
  ISFJ: "Arts / Science",
  INFJ: "Arts / Humanities",
  INTJ: "Science / Commerce",
  ISTP: "Science",
  ISFP: "Arts / Humanities",
  INFP: "Arts / Humanities",
  INTP: "Science",
  ESTP: "Commerce / Science",
  ESFP: "Arts / Commerce",
  ENFP: "Arts / Commerce",
  ENTP: "Commerce / Science",
  ESTJ: "Commerce",
  ESFJ: "Arts / Commerce",
  ENFJ: "Arts / Humanities",
  ENTJ: "Commerce / Science",
};

export const PERSONALITY_SUBJECTS: Record<string, string[]> = {
  ISTJ: ["Mathematics", "Accountancy", "Economics", "Statistics"],
  ISFJ: ["Biology", "Psychology", "Sociology", "Education"],
  INFJ: ["Psychology", "Literature", "Philosophy", "Sociology"],
  INTJ: ["Mathematics", "Physics", "Computer Science", "Economics"],
  ISTP: ["Physics", "Mathematics", "Computer Science"],
  ISFP: ["Design", "Fine Arts", "Media Studies"],
  INFP: ["Literature", "Psychology", "Philosophy"],
  INTP: ["Mathematics", "Physics", "Computer Science", "Statistics"],
  ESTP: ["Business Studies", "Economics", "Mathematics"],
  ESFP: ["Media Studies", "Communication", "Performing Arts"],
  ENFP: ["Marketing", "Psychology", "Media Studies"],
  ENTP: ["Entrepreneurship", "Economics", "Computer Science"],
  ESTJ: ["Accountancy", "Business Studies", "Economics"],
  ESFJ: ["Psychology", "Sociology", "Communication"],
  ENFJ: ["Psychology", "Political Science", "Literature"],
  ENTJ: ["Economics", "Mathematics", "Business Studies"],
};
