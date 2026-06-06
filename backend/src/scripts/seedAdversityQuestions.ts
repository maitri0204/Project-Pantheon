/**
 * Resilience Quotient (RQ) Questions Seed Data for Project Pantheon
 *
 * The local fallback below keeps Pantheon bootable, but when the
 * Adversity-Test source file is available on this machine we prefer
 * loading that exact bank so the question text/options stay identical.
 */

import fs from "fs";
import path from "path";

const EXTERNAL_ADVERSITY_TEST_SOURCE = "/Users/maitripatel/Downloads/Adversity-Test/backend/src/scripts/seed-questions.ts";

type ExternalAdversityQuestion = {
  title: string;
  scenario: string;
  options: Array<{ label: string; text: string; hiddenScore: number }>;
  aqDimension: string;
  difficulty?: string;
  domain?: string;
  isPublished?: boolean;
};

type PantheonAdversityQuestion = {
  assessmentCode: "RESILIENCE_TEST";
  category: string;
  categoryLabel: string;
  questionNumber: number;
  title: string;
  questionText: string;
  options: Array<{ label: string; text: string; score: number }>;
};

const normalizeExternalAdversityQuestions = (questions: ExternalAdversityQuestion[]): PantheonAdversityQuestion[] => {
  return questions.map((question, index) => ({
    assessmentCode: "RESILIENCE_TEST",
    category: question.aqDimension,
    categoryLabel: question.aqDimension,
    questionNumber: index + 1,
    title: question.title,
    questionText: question.scenario,
    options: question.options.map((option) => ({
      label: option.label,
      text: option.text,
      score: option.hiddenScore,
    })),
  }));
};

const loadExternalAdversityQuestions = (): PantheonAdversityQuestion[] | null => {
  try {
    if (!fs.existsSync(EXTERNAL_ADVERSITY_TEST_SOURCE)) {
      return null;
    }

    const raw = fs.readFileSync(EXTERNAL_ADVERSITY_TEST_SOURCE, "utf8");
    const startMarker = "const SEED_QUESTIONS = [";
    const startIndex = raw.indexOf(startMarker);
    if (startIndex < 0) {
      return null;
    }

    const endIndex = raw.indexOf("];", startIndex);
    if (endIndex < 0) {
      return null;
    }

    const arraySource = raw.slice(startIndex + startMarker.length - 1, endIndex + 1);
    // eslint-disable-next-line no-new-func
    const loaded = new Function(`return ${arraySource};`)();
    if (!Array.isArray(loaded)) {
      return null;
    }

    return normalizeExternalAdversityQuestions(loaded as ExternalAdversityQuestion[]);
  } catch (error) {
    console.warn(
      `Failed to load external RQ source from ${path.basename(EXTERNAL_ADVERSITY_TEST_SOURCE)}; falling back to local RQ seed data.`,
      error
    );
    return null;
  }
};

const LOCAL_ADVERSITY_TEST_QUESTIONS: PantheonAdversityQuestion[] = [
  // ─── CONTROL DIMENSION (6 questions) ─────────────────────────────────────
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Control",
    categoryLabel: "Control",
    questionNumber: 1,
    title: "Work Challenge",
    questionText: "When facing a difficult project deadline, I:",
    options: [
      { label: "A", text: "Take charge and develop an action plan immediately", score: 4 },
      { label: "B", text: "Try to manage but feel unsure about my approach", score: 3 },
      { label: "C", text: "Hope my supervisor will provide guidance", score: 2 },
      { label: "D", text: "Feel overwhelmed and wait to see what happens", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Control",
    categoryLabel: "Control",
    questionNumber: 2,
    title: "Problem-Solving Approach",
    questionText: "When facing a complex problem, I:",
    options: [
      { label: "A", text: "Break it into manageable parts and tackle each one", score: 4 },
      { label: "B", text: "Try different approaches with moderate success", score: 3 },
      { label: "C", text: "Ask others for help or solutions", score: 2 },
      { label: "D", text: "Feel helpless about finding a solution", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Control",
    categoryLabel: "Control",
    questionNumber: 3,
    title: "Facing Setbacks",
    questionText: "When I experience a setback, my first thought is:",
    options: [
      { label: "A", text: "What can I do differently next time?", score: 4 },
      { label: "B", text: "I'll try a different approach", score: 3 },
      { label: "C", text: "I wonder if I was unlucky", score: 2 },
      { label: "D", text: "There's nothing I can do to change the outcome", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Control",
    categoryLabel: "Control",
    questionNumber: 4,
    title: "Learning from Failure",
    questionText: "After failing at something important, I:",
    options: [
      { label: "A", text: "Analyze what went wrong and create an improvement plan", score: 4 },
      { label: "B", text: "Try again with some modifications", score: 3 },
      { label: "C", text: "Feel discouraged and hesitant to try again", score: 2 },
      { label: "D", text: "Avoid similar situations in the future", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Control",
    categoryLabel: "Control",
    questionNumber: 5,
    title: "Uncertainty Management",
    questionText: "In uncertain situations, I typically:",
    options: [
      { label: "A", text: "Create contingency plans and move forward confidently", score: 4 },
      { label: "B", text: "Make reasonable plans despite the uncertainty", score: 3 },
      { label: "C", text: "Feel anxious but try to proceed", score: 2 },
      { label: "D", text: "Become paralyzed and unable to act", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Control",
    categoryLabel: "Control",
    questionNumber: 6,
    title: "Personal Agency",
    questionText: "When things go wrong, I believe:",
    options: [
      { label: "A", text: "I have significant influence over outcomes", score: 4 },
      { label: "B", text: "I can influence some aspects of the situation", score: 3 },
      { label: "C", text: "Luck and circumstances matter more than my actions", score: 2 },
      { label: "D", text: "External forces are beyond my control", score: 1 },
    ],
  },

  // ─── OWNERSHIP DIMENSION (5 questions) ───────────────────────────────────
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Ownership",
    categoryLabel: "Ownership",
    questionNumber: 7,
    title: "Taking Responsibility",
    questionText: "When a project I'm involved in fails, I:",
    options: [
      { label: "A", text: "Take responsibility and focus on solutions", score: 4 },
      { label: "B", text: "Share responsibility and help find solutions", score: 3 },
      { label: "C", text: "Acknowledge my role but emphasize others' contributions to the failure", score: 2 },
      { label: "D", text: "Blame external factors or other people", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Ownership",
    categoryLabel: "Ownership",
    questionNumber: 8,
    title: "Interpersonal Conflict",
    questionText: "After a conflict with someone, I:",
    options: [
      { label: "A", text: "Reflect on my contribution and initiate honest dialogue", score: 4 },
      { label: "B", text: "Try to understand both perspectives", score: 3 },
      { label: "C", text: "Focus on their shortcomings in the situation", score: 2 },
      { label: "D", text: "Believe it's entirely their fault", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Ownership",
    categoryLabel: "Ownership",
    questionNumber: 9,
    title: "Accountability",
    questionText: "When I make a mistake at work, I:",
    options: [
      { label: "A", text: "Immediately take ownership and present a solution", score: 4 },
      { label: "B", text: "Admit the mistake and offer to fix it", score: 3 },
      { label: "C", text: "Admit it reluctantly and need prompting to help fix it", score: 2 },
      { label: "D", text: "Try to minimize the mistake or shift focus elsewhere", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Ownership",
    categoryLabel: "Ownership",
    questionNumber: 10,
    title: "Personal Goals",
    questionText: "If I'm not achieving my personal goals, I:",
    options: [
      { label: "A", text: "Examine my efforts and adjust my strategy", score: 4 },
      { label: "B", text: "Work harder and try a different approach", score: 3 },
      { label: "C", text: "Feel frustrated that circumstances aren't cooperating", score: 2 },
      { label: "D", text: "Conclude it's not meant to be or I'm not capable", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Ownership",
    categoryLabel: "Ownership",
    questionNumber: 11,
    title: "Feedback Response",
    questionText: "When receiving critical feedback, I:",
    options: [
      { label: "A", text: "Listen carefully and look for actionable insights", score: 4 },
      { label: "B", text: "Consider it seriously and determine what's valid", score: 3 },
      { label: "C", text: "Feel defensive but try to stay open", score: 2 },
      { label: "D", text: "Dismiss it or assume the person is wrong", score: 1 },
    ],
  },

  // ─── REACH DIMENSION (7 questions) ───────────────────────────────────────
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Reach",
    categoryLabel: "Reach",
    questionNumber: 12,
    title: "Compartmentalization",
    questionText: "A failure in one area of my life typically:",
    options: [
      { label: "A", text: "Stays contained to that area", score: 4 },
      { label: "B", text: "Affects me temporarily in other areas", score: 3 },
      { label: "C", text: "Significantly impacts my mood and performance elsewhere", score: 2 },
      { label: "D", text: "Makes me feel like a failure in all aspects of life", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Reach",
    categoryLabel: "Reach",
    questionNumber: 13,
    title: "Optimism in Other Areas",
    questionText: "When facing difficulty in work, my personal relationships are:",
    options: [
      { label: "A", text: "Largely unaffected; I maintain normal interactions", score: 4 },
      { label: "B", text: "Slightly affected but generally stable", score: 3 },
      { label: "C", text: "Noticeably strained due to my mood", score: 2 },
      { label: "D", text: "Significantly damaged as I withdraw and isolate", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Reach",
    categoryLabel: "Reach",
    questionNumber: 14,
    title: "General Outlook",
    questionText: "When something goes wrong, my general view is:",
    options: [
      { label: "A", text: "This specific situation is challenging, but most things will be okay", score: 4 },
      { label: "B", text: "This will affect me for a while, but I'll move forward", score: 3 },
      { label: "C", text: "This might affect multiple areas of my life", score: 2 },
      { label: "D", text: "Everything feels like it's falling apart", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Reach",
    categoryLabel: "Reach",
    questionNumber: 15,
    title: "Perspective Maintenance",
    questionText: "During challenging times, I can usually:",
    options: [
      { label: "A", text: "Maintain perspective about the bigger picture", score: 4 },
      { label: "B", text: "Remind myself that this will pass", score: 3 },
      { label: "C", text: "Sometimes remember that it's temporary", score: 2 },
      { label: "D", text: "Feel like the situation will never improve", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Reach",
    categoryLabel: "Reach",
    questionNumber: 16,
    title: "Resilience After Setback",
    questionText: "After experiencing a significant setback, my ability to enjoy other things:",
    options: [
      { label: "A", text: "Remains strong; I can appreciate positive experiences", score: 4 },
      { label: "B", text: "Is moderately affected but recovers quickly", score: 3 },
      { label: "C", text: "Is significantly dampened for a period", score: 2 },
      { label: "D", text: "Is lost; I struggle to enjoy anything", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Reach",
    categoryLabel: "Reach",
    questionNumber: 17,
    title: "Boundary Setting",
    questionText: "I'm able to keep professional challenges separate from my personal life:",
    options: [
      { label: "A", text: "Very easily; I have clear boundaries", score: 4 },
      { label: "B", text: "Usually; some leakage but manageable", score: 3 },
      { label: "C", text: "Sometimes; but work often affects home life", score: 2 },
      { label: "D", text: "Rarely; everything feels interconnected", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Reach",
    categoryLabel: "Reach",
    questionNumber: 18,
    title: "Hope and Possibility",
    questionText: "When facing a major challenge, I generally believe:",
    options: [
      { label: "A", text: "There are multiple ways to address this challenge", score: 4 },
      { label: "B", text: "There are some viable solutions", score: 3 },
      { label: "C", text: "There might be a solution if I look hard enough", score: 2 },
      { label: "D", text: "There's likely no good solution", score: 1 },
    ],
  },

  // ─── ENDURANCE DIMENSION (7 questions) ───────────────────────────────────
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Endurance",
    categoryLabel: "Endurance",
    questionNumber: 19,
    title: "Negative Events Duration",
    questionText: "When something bad happens, I typically expect the impact to last:",
    options: [
      { label: "A", text: "A short time; I'll move past it quickly", score: 4 },
      { label: "B", text: "Weeks, but I'll gradually recover", score: 3 },
      { label: "C", text: "Months; it will take time to get over it", score: 2 },
      { label: "D", text: "A very long time; it might permanently affect me", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Endurance",
    categoryLabel: "Endurance",
    questionNumber: 20,
    title: "Recovery Confidence",
    questionText: "After a major disappointment, I typically believe:",
    options: [
      { label: "A", text: "I'll bounce back quickly with my efforts", score: 4 },
      { label: "B", text: "I'll eventually recover with time", score: 3 },
      { label: "C", text: "Recovery will be slow and difficult", score: 2 },
      { label: "D", text: "I may never fully recover", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Endurance",
    categoryLabel: "Endurance",
    questionNumber: 21,
    title: "Persistent Effects",
    questionText: "Past failures or rejections:",
    options: [
      { label: "A", text: "Have minimal effect on my current confidence", score: 4 },
      { label: "B", text: "Occasionally influence my confidence", score: 3 },
      { label: "C", text: "Frequently remind me of my past limitations", score: 2 },
      { label: "D", text: "Continuously haunt me and affect my self-belief", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Endurance",
    categoryLabel: "Endurance",
    questionNumber: 22,
    title: "Moving Forward",
    questionText: "After a difficult experience, I can usually:",
    options: [
      { label: "A", text: "Learn from it and move forward with renewed strength", score: 4 },
      { label: "B", text: "Learn from it and gradually move forward", score: 3 },
      { label: "C", text: "Move forward, but the experience stays with me", score: 2 },
      { label: "D", text: "Struggle to move forward despite time passing", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Endurance",
    categoryLabel: "Endurance",
    questionNumber: 23,
    title: "Time Perspective",
    questionText: "I believe challenges are typically:",
    options: [
      { label: "A", text: "Temporary; they will resolve with time and effort", score: 4 },
      { label: "B", text: "Usually temporary with some lingering effects", score: 3 },
      { label: "C", text: "Likely to last for an extended period", score: 2 },
      { label: "D", text: "Potentially permanent parts of my life", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Endurance",
    categoryLabel: "Endurance",
    questionNumber: 24,
    title: "Energy During Hardship",
    questionText: "During difficult times, my energy levels are:",
    options: [
      { label: "A", text: "High; I'm motivated to work through it", score: 4 },
      { label: "B", text: "Moderate; I manage to push forward", score: 3 },
      { label: "C", text: "Low; I struggle with motivation", score: 2 },
      { label: "D", text: "Very low; I feel exhausted and stuck", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Endurance",
    categoryLabel: "Endurance",
    questionNumber: 25,
    title: "Opportunity Recognition",
    questionText: "When facing a setback, I typically see it as:",
    options: [
      { label: "A", text: "An opportunity to learn and grow stronger", score: 4 },
      { label: "B", text: "A challenge that might have some learning value", score: 3 },
      { label: "C", text: "An unfortunate event to get through", score: 2 },
      { label: "D", text: "A confirmation that I can't succeed", score: 1 },
    ],
  },

  // ─── REFLECTION DIMENSION (5 questions) ──────────────────────────────────
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Reflection",
    categoryLabel: "Reflection",
    questionNumber: 26,
    title: "Self-Awareness",
    questionText: "When dealing with stress, I:",
    options: [
      { label: "A", text: "Notice my patterns and adjust my approach proactively", score: 4 },
      { label: "B", text: "Recognize my patterns after some reflection", score: 3 },
      { label: "C", text: "Eventually realize what's not working", score: 2 },
      { label: "D", text: "Usually don't understand why I'm struggling", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Reflection",
    categoryLabel: "Reflection",
    questionNumber: 27,
    title: "Growth Mindset",
    questionText: "I believe my ability to handle adversity:",
    options: [
      { label: "A", text: "Can be continuously developed and strengthened", score: 4 },
      { label: "B", text: "Can improve with practice and learning", score: 3 },
      { label: "C", text: "Is somewhat fixed but can change", score: 2 },
      { label: "D", text: "Is largely determined by my personality", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Reflection",
    categoryLabel: "Reflection",
    questionNumber: 28,
    title: "Seeking Support",
    questionText: "When I'm struggling, I:",
    options: [
      { label: "A", text: "Seek appropriate help and support without shame", score: 4 },
      { label: "B", text: "Reach out to trusted people for support", score: 3 },
      { label: "C", text: "Try to handle it alone but might ask for help", score: 2 },
      { label: "D", text: "Isolate myself and don't ask for help", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Reflection",
    categoryLabel: "Reflection",
    questionNumber: 29,
    title: "Adaptability",
    questionText: "When my initial approach doesn't work, I:",
    options: [
      { label: "A", text: "Quickly adapt and try alternative strategies", score: 4 },
      { label: "B", text: "Adjust my approach after some consideration", score: 3 },
      { label: "C", text: "Reluctantly try different approaches", score: 2 },
      { label: "D", text: "Struggle to shift my approach", score: 1 },
    ],
  },
  {
    assessmentCode: "RESILIENCE_TEST",
    category: "Reflection",
    categoryLabel: "Reflection",
    questionNumber: 30,
    title: "Resilience Belief",
    questionText: "Overall, my belief in my resilience to handle life's challenges is:",
    options: [
      { label: "A", text: "Very strong; I'm confident I can handle most challenges", score: 4 },
      { label: "B", text: "Generally strong; I've handled challenges in the past", score: 3 },
      { label: "C", text: "Moderate; I sometimes doubt my ability", score: 2 },
      { label: "D", text: "Low; I'm not sure I can handle significant challenges", score: 1 },
    ],
  },
];

export const ADVERSITY_TEST_QUESTIONS = loadExternalAdversityQuestions() ?? LOCAL_ADVERSITY_TEST_QUESTIONS;
