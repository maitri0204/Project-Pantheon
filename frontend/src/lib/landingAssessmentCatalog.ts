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
      "Know your traits and personality",
      "Suggested career and stream",
      "Your thinking and decision methods",
      "Your learning and success drivers",
      "Your academic profile",
      "Subjects and stream fit analysis",
      "Top 10 career matches",
      "Suggested job roles",
    ],
    icon: Compass,
  },
  {
    name: "Career DNA Profile",
    tagline: "Complete Career Clarity Assessment",
    definition:
      "A complete career clarity assessment to help students choose the right stream, subjects, career domain, and future direction.",
    audience: "Students planning their career journey",
    formatType: "MCQs (multi-section)",
    duration: "~45-60 min",
    scoring: "Section-wise capability scores",
    measures: [
      "Identify your Cognitive Ability and Aptitude Score",
      "Understand your academic strengths and developmental areas",
      "Discover your personality profile",
      "Map your career interests with suitable domains",
      "Understand your emotional intelligence and learning style",
      "Identify your Resilience Quotient",
      "Get potential career options with suggested subjects and programs",
      "Find your suitable career stream, domain, career role, and job role",
      "Receive a complete Career Growth Blueprint",
    ],
    icon: Dna,
  },
  {
    name: "CLEAR Self-Awareness Assessment",
    tagline: "Cognitive Lens for Emotional Awareness & Reflection",
    definition:
      "Understand how you see yourself, how others may experience you, and where your real growth potential lies.",
    audience: "Students",
    formatType: "MCQs",
    duration: "~10-15 min",
    scoring: "Quadrant-based self-awareness scores",
    measures: [
      "Discover your Feedback-Seeking and Self-Disclosure patterns",
      "Understand your personal growth potential",
      "Identify your complete self-awareness profile",
      "Analyse your growth zone and improvement areas",
      "Know your personal impact on others",
      "Identify your key growth challenges",
      "Receive a focused 90-Day Personal Growth Plan",
    ],
    icon: Eye,
  },
  {
    name: "Litmus Parenting Assessment",
    tagline: "Parenting Style Assessment for Parents",
    definition:
      "Discover how your parenting style shapes your child's confidence, behaviour, and growth.",
    audience: "Parents",
    formatType: "MCQs",
    duration: "~10-15 min",
    scoring: "Primary & secondary style + parenting score",
    measures: [
      "Identify your Primary and Secondary Parenting Style",
      "Understand your key Parenting Strengths",
      "Discover where your parenting approach can be improved or reshaped",
      "Know what truly drives your parenting decisions",
      "Understand how your child is likely experiencing your parenting style",
      "Identify possible parenting risk areas",
      "Receive a practical 90-Day Parenting Improvement Plan",
    ],
    icon: HeartHandshake,
  },
  {
    name: "Learning Intelligence Test",
    tagline: "Thinking & Expression Skills Test",
    definition:
      "Understand how you learn, think, study, and perform academically.",
    audience: "Students",
    formatType: "MCQs",
    duration: "~15-20 min",
    scoring: "Domain-wise thinking & expression scores",
    measures: [
      "Discover your Learning Intelligence Profile",
      "Identify your natural learning strengths",
      "Understand your thinking style profile",
      "Know your study pattern and how it affects academic performance",
      "Identify your learning challenges and improvement areas",
      "Receive a practical 90-Day Learning Improvement Plan",
    ],
    icon: Brain,
  },
  {
    name: "RQ Resilience Quotient Analysis",
    tagline: "Resilience Under Pressure & Adversity",
    definition:
      "Understand how strongly you respond to pressure, setbacks, stress, and emotional challenges.",
    audience: "Students",
    formatType: "MCQs",
    duration: "~15-20 min",
    scoring: "CORE model resilience score",
    measures: [
      "Know your overall resilience score",
      "Get a dimensional analysis of your resilience ability",
      "Understand your behaviour patterns in different situations",
      "Analyse your emotional and stress response profile",
      "Identify your strengths and weaknesses",
      "Receive a practical 30-Day RQ Development Roadmap",
    ],
    icon: ShieldCheck,
  },
  {
    name: "AIM Academic Interest Mapping",
    tagline: "Grade-Specific Interest & Stream Finder",
    definition:
      "Identify the student's academic interests, career direction, and stream readiness with a structured assessment.",
    audience: "Student: Grade 8-10",
    formatType: "MCQs",
    duration: "~20-25 min",
    scoring: "Scores across 10 interest domains",
    measures: [
      "Discover your multidimensional Academic and Career Interest Profile",
      "Understand the academic alignment of your interest areas",
      "Analyse your stream readiness",
      "Get a list of suggested career options",
      "Identify key developmental areas for better academic and career planning",
    ],
    icon: GraduationCap,
  },
  {
    name: "Study Abroad Readiness Assessment",
    tagline: "12-Dimension Readiness Assessment",
    definition:
      "Know whether you are truly ready for international education before making a costly decision.",
    audience: "Students: UG & PG aspirants",
    formatType: "MCQs",
    duration: "~20-25 min",
    scoring: "Marks out of 150 + 12-dimension radar",
    measures: [
      "Get your complete Study Abroad Readiness Score with detailed analysis",
      "Understand your academic, scholastic, personal, and parental readiness",
      "Receive a 12-Dimensional Study Abroad Readiness Index",
      "Identify your strengths and priority focus areas",
      "Get a personalised study abroad roadmap",
      "Receive clear final recommendations for your next steps",
    ],
    icon: Plane,
  },
];
