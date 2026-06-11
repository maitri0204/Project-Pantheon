import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Compass,
  Dna,
  Eye,
  GraduationCap,
  HeartHandshake,
  Plane,
  ShieldCheck,
} from "lucide-react";

export type LandingAssessmentDetail = {
  name: string;
  tagline: string;
  definition: string;
  audience: string;
  formatType: string;
  duration: string;
  scoring: string;
  measures: string[];
  icon: LucideIcon;
};

/** Detailed catalog for the "Explore Our 8 Assessments" landing section. */
export const LANDING_ASSESSMENT_CATALOG: LandingAssessmentDetail[] = [
  {
    name: "Career Compass",
    tagline: "Career Exploration & Planning Assessment",
    definition:
      "A scientifically designed personality assessment that helps students understand their strengths, interests, and natural working style - so they can choose the right stream, subjects, and career path with confidence.",
    audience: "Students: Grade 8 onwards",
    formatType: "MCQs",
    duration: "~25-30 min",
    scoring: "4-dimension personality profile",
    measures: [
      "Know your Traits & Personality",
      "Suggested Career & Stream",
      "Your Thinking & Decision Methods",
      "Your Learning & Success Divers",
      "Your Academic Profile",
      "Subjects & STream fit Analysis",
      "Top 10 Career Matches",
      "Suggested Job Roles",
    ],
    icon: Compass,
  },
  {
    name: "Career DNA Profiler",
    tagline: "Career Path Discovery Navigator",
    definition:
      "A multi-section profiler that goes beyond one test. It measures how students think, decide, learn, adapt, and perform - combining 8 capability domains into one integrated career profile.",
    audience: "Students planning their career journey",
    formatType: "MCQs (multi-section)",
    duration: "~45-60 min",
    scoring: "Section-wise capability scores",
    measures: [
      "Cognitive ability & aptitude - reasoning, memory, creativity",
      "Personality & career interest (RIASEC) mapping",
      "Emotional intelligence & learning style",
      "Behavioral skills, stress handling & resilience",
    ],
    icon: Dna,
  },
  {
    name: "CLEAR Assessment",
    tagline: "Cognitive Lens for Emotional Awareness & Reflection",
    definition:
      "A structured self-awareness and communication assessment. It shows students how they see themselves versus how others see them - building confidence, clarity, and stronger relationships.",
    audience: "Students",
    formatType: "MCQs",
    duration: "~10-15 min",
    scoring: "Quadrant-based self-awareness scores",
    measures: [
      "Self-awareness - how you actually show up in conversations",
      "Communication clarity - expressing what you really think",
      "Feedback handling - responding without shutting down",
      "Relationship building - connecting better with peers",
    ],
    icon: Eye,
  },
  {
    name: "Litmus Test",
    tagline: "Parenting Style Assessment for Parents",
    definition:
      "The first step to confident parenting. This parent-focused assessment identifies how you guide, support, and influence your child's decisions - and how your parenting style shapes their confidence and future.",
    audience: "Parents",
    formatType: "MCQs",
    duration: "~10-15 min",
    scoring: "Primary & secondary style + parenting score",
    measures: [
      "Your dominant parenting style across 5 style dimensions",
      "How your behavior shapes your child's confidence",
      "Where your guidance helps - and where it holds back",
      "A clear parenting score with actionable insights",
    ],
    icon: HeartHandshake,
  },
  {
    name: "TEST Assessment",
    tagline: "Thinking & Expression Skills Test",
    definition:
      "Every child thinks differently. This metacognition assessment evaluates how students think, learn, reflect, and express ideas - beyond memory alone - to develop confident thinkers and independent learners.",
    audience: "Students",
    formatType: "MCQs",
    duration: "~15-20 min",
    scoring: "Domain-wise thinking & expression scores",
    measures: [
      "Thinking awareness - how you understand and plan solutions",
      "Learning strategy - how effectively you study and absorb",
      "Self-monitoring - checking and correcting your own work",
      "Expression - explaining your ideas with clarity",
    ],
    icon: Brain,
  },
  {
    name: "Resilience Quotient",
    tagline: "RQ Assessment",
    definition:
      "Measures how students respond to setbacks, stress, and pressure in real-life situations. Your resilience profile is mapped across four proven dimensions: Control, Ownership, Reach, and Endurance.",
    audience: "Students",
    formatType: "MCQs",
    duration: "~15-20 min",
    scoring: "CORE model resilience score",
    measures: [
      "Control - how much influence you feel over challenges",
      "Ownership - taking responsibility for outcomes",
      "Reach - keeping setbacks from spreading to other areas",
      "Endurance - how quickly you bounce back",
    ],
    icon: ShieldCheck,
  },
  {
    name: "Academic Career & Interest",
    tagline: "Grade-Specific Interest & Stream Finder",
    definition:
      "A grade-specific assessment for students in Grades 8, 9, and 10 that identifies strong interest domains and aligns them with subjects, streams, and career exposure - replacing guesswork with evidence.",
    audience: "Students: Grade 8-10",
    formatType: "MCQs",
    duration: "~20-25 min",
    scoring: "Scores across 10 interest domains",
    measures: [
      "Your strongest interest domains out of 10 interest codes",
      "Stream fit - Science, Commerce, Arts & interdisciplinary",
      "Subject alignment matched to your interests",
      "Career exposure paths for early planning",
    ],
    icon: GraduationCap,
  },
  {
    name: "Study Abroad Readiness",
    tagline: "12-Dimension Readiness Assessment",
    definition:
      "Measures how prepared you really are to study abroad - across language, academics, finances, visa awareness, culture, resilience, and decision-making. Each session draws 50 randomized questions from a 150-question bank.",
    audience: "Students: UG & PG aspirants",
    formatType: "MCQs",
    duration: "~20-25 min",
    scoring: "Marks out of 150 + 12-dimension radar",
    measures: [
      "Language, academic & financial preparedness",
      "Visa, documentation & application awareness",
      "Cultural adaptability and independent living",
      "Decision-making clarity with a radar-style report",
    ],
    icon: Plane,
  },
];
