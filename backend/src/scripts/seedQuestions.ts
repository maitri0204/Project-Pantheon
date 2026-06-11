/**
 * Pantheon Unified Question Seed Script
 *
 * Reads question data from all 5 assessment apps at runtime,
 * strips TypeScript-specific syntax, evaluates the arrays,
 * maps them to Pantheon's Question model, and upserts into MongoDB.
 *
 * Run: npx ts-node src/scripts/seedQuestions.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not set in .env");
  process.exit(1);
}

// ─── Question Model ─────────────────────────────────────────────────────────
const questionSchema = new mongoose.Schema(
  {
    assessmentCode: { type: String, required: true },
    category: { type: String, required: true },
    categoryLabel: { type: String, required: true },
    questionNumber: { type: Number, required: true },
    title: { type: String, default: "" },
    questionText: { type: String, required: true },
    options: {
      type: [
        {
          label: { type: String, required: true },
          text: { type: String, required: true },
          score: { type: Number, default: undefined },
        },
      ],
      default: [],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
questionSchema.index({ assessmentCode: 1, category: 1, questionNumber: 1 }, { unique: true });

const Question =
  (mongoose.models.Question as mongoose.Model<mongoose.Document>) ||
  mongoose.model("Question", questionSchema);

// ─── Source file paths ───────────────────────────────────────────────────────
const BASE = path.join(__dirname, "../../../../");

const SOURCE_FILES = {
  CAREER_COMPASS: path.join(BASE, "Project-Career_Compass/backend/src/scripts/seedPersonalityQuestions.ts"),
  LITMUS_TEST: path.join(BASE, "Project-Litmus_Test/backend/src/scripts/seedQuestions.ts"),
  JOHARI_WINDOW: path.join(BASE, "Project-Johari_Window/backend/src/scripts/seedQuestions.ts"),
  METACOGNITION: path.join(BASE, "Project-Metacognition_Test/backend/src/scripts/seedQuestions.ts"),
  CAREER_DNA_APTITUDE: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedAptitudeQuestions.ts"),
  CAREER_DNA_BEHAVIORAL: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedBehavioralSocialQuestions.ts"),
  CAREER_DNA_CAREER_INTEREST: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedCareerInterestQuestions.ts"),
  CAREER_DNA_COGNITIVE: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedCognitiveQuestions.ts"),
  CAREER_DNA_EMOTIONAL: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedEmotionalIntelligenceQuestions.ts"),
  CAREER_DNA_LEARNING: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedLearningStyleQuestions.ts"),
  CAREER_DNA_PERSONALITY: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedPersonalityQuestions.ts"),
  CAREER_DNA_STRESS: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedStressResilienceQuestions.ts"),
};

// ─── TypeScript stripper ─────────────────────────────────────────────────────
function stripTypeScript(code: string): string {
  let r = code;

  // 1. Remove single-line import statements
  r = r.replace(/^import\b[^\n]*\n/gm, "");

  // 2. Remove dotenv config calls and env var declarations
  r = r.replace(/^dotenv\.[^\n]*\n/gm, "");
  r = r.replace(/^(?:const|let)\s+(?:MONGO_URI|MONGODB_URI)\s*=[^\n]*\n/gm, "");

  // 3. Remove top-level `if (!MONGODB_URI) { ... }` guard blocks (up to closing })
  r = r.replace(/^if\s*\(\s*!(?:MONGO_URI|MONGODB_URI)[^)]*\)\s*\{[^}]*\}/m, "");

  // 4. Remove TypeScript `interface` blocks (multi-line)
  r = r.replace(/^interface\s+\w+[^\n]*\{[\s\S]*?\n\}/gm, "");

  // 5. Remove `as const` and `as SomeType` type assertions
  r = r.replace(/\s+as\s+const\b/g, "");
  r = r.replace(/\s+as\s+[A-Z][a-zA-Z<>, [\]|&]*(?=[,\s)\};\]])/g, "");

  // 6. Strip TypeScript TUPLE type annotations ONLY (e.g. `: [string, string, string, string]`)
  //    Only matches primitive type keywords, NOT value arrays like `["A","B","C","D"]`
  r = r.replace(
    /:\s*\[\s*(?:string|number|boolean|any)(?:\s*,\s*(?:string|number|boolean|any))*\s*\]/g,
    ""
  );

  // 7. Remove `: SomeType[]` or `: SomeType` type annotations on `const arr: Type = [` declarations
  r = r.replace(/^(const\s+\w+)\s*:\s*[A-Z]\w*(?:<[^>]*>)?(?:\[\])?\s*=/gm, "$1 =");

  // 8. Remove simple primitive type annotations on function parameters
  //    e.g. `pn: number` → `pn`, `text: string` → `text`
  r = r.replace(
    /(\w)\s*:\s*(?:number|string|boolean|any|undefined|null)(?:\s*\[\])?(?=\s*[,)=?])/g,
    "$1"
  );

  // 9. Remove optional+typed params like `passage?: string` → `passage`
  r = r.replace(/(\w+)\?:\s*(?:string|number|boolean|any)(?:\s*\[\])?\b/g, "$1");

  // 10. Remove function return type annotations: `): ReturnType {`
  r = r.replace(/\)\s*:\s*[A-Z]\w*(?:<[^>]*>)?\s*\{/g, ") {");
  r = r.replace(/\)\s*:\s*(?:void|string|number|boolean|any)\s*\{/g, ") {");

  // 11. Stop before the async seed function (handles `const seedX = async` and `async function seed`)
  r = r.replace(/\bconst seed[A-Za-z]+\s*=\s*async[\s\S]*/m, "");
  r = r.replace(/\basync function seed\b[\s\S]*/m, "");
  r = r.replace(/\bfunction seed\b[\s\S]*/m, "");
  // Also remove standalone seed function calls at end
  r = r.replace(/^seed[A-Za-z]*\(\);?\s*$/gm, "");

  return r;
}

// ─── Load questions from a source file ───────────────────────────────────────
function loadQuestionsFromFile(
  filePath: string,
  arrayVarName: string
): unknown[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const stripped = stripTypeScript(raw);

  try {
    // Build a function that evaluates the stripped code and returns the named array
    // eslint-disable-next-line no-new-func
    const fn = new Function(
      `${stripped}
       return typeof ${arrayVarName} !== "undefined" ? ${arrayVarName} : [];`
    );
    const result = fn() as unknown[];
    return Array.isArray(result) ? result : [];
  } catch (err) {
    console.error(`❌ Failed to evaluate ${path.basename(filePath)}:`, err);
    // Debug: print stripped code around the error
    console.error("--- Stripped code (first 500 chars) ---");
    console.error(stripped.slice(0, 500));
    return [];
  }
}

// ─── Default options for assessments that use a fixed option set ─────────────
const LITMUS_OPTIONS = [
  { label: "1", text: "Strongly Disagree", score: 1 },
  { label: "2", text: "Disagree", score: 2 },
  { label: "3", text: "Neutral", score: 3 },
  { label: "4", text: "Agree", score: 4 },
  { label: "5", text: "Strongly Agree", score: 5 },
];

// ─── Litmus Test style name map ───────────────────────────────────────────────
const LITMUS_STYLE_NAMES: Record<string, string> = {
  K: "King",
  S: "Servant",
  E: "Elder",
  P: "Prince",
  J: "Joker",
};

// ─── Map questions to Pantheon format ────────────────────────────────────────
interface PantheonQuestionOption {
  label: string;
  text: string;
  score?: number;
}

interface PantheonQuestion {
  assessmentCode: string;
  category: string;
  categoryLabel: string;
  questionNumber: number;
  title: string;
  questionText: string;
  options: PantheonQuestionOption[];
  correctAnswer?: string;
  isActive: boolean;
}

function mapCareerCompass(raw: unknown[]): PantheonQuestion[] {
  return raw.map((q: any) => ({
    assessmentCode: "CAREER_COMPASS",
    category: String(q.partNumber ?? "1"),
    categoryLabel: q.partName ?? "General",
    questionNumber: Number(q.questionNumber),
    title: q.partName ?? "",
    questionText: q.questionText,
    options: Array.isArray(q.options)
      ? q.options.map((o: any) => ({ label: o.label, text: o.text, score: o.score }))
      : [],
    isActive: true,
  }));
}

function mapCareerDNA(raw: unknown[], testType: string): PantheonQuestion[] {
  return raw.map((q: any) => ({
    assessmentCode: "CAREER_DNA",
    category: `${testType}_${q.partNumber ?? 1}`,
    categoryLabel: q.partName ?? testType,
    questionNumber: Number(q.questionNumber),
    title: q.partName ?? "",
    questionText: q.questionText,
    options: Array.isArray(q.options)
      ? q.options.map((o: any) => ({ label: o.label, text: o.text, score: o.score }))
      : [],
    correctAnswer: q.correctAnswer ?? undefined,
    isActive: true,
  }));
}

function mapJohari(raw: unknown[]): PantheonQuestion[] {
  return raw.map((q: any) => ({
    assessmentCode: "JOHARI_WINDOW",
    category: "1",
    categoryLabel: "CLEAR Awareness",
    questionNumber: Number(q.questionNumber),
    title: "CLEAR",
    questionText: q.questionText,
    options: Array.isArray(q.options)
      ? q.options.map((o: any) => ({ label: o.label, text: o.text, score: o.score }))
      : [],
    isActive: true,
  }));
}

function mapLitmus(raw: unknown[]): PantheonQuestion[] {
  return raw.map((q: any) => ({
    assessmentCode: "LITMUS_TEST",
    category: q.style ?? "K",
    categoryLabel: LITMUS_STYLE_NAMES[q.style] ?? q.style,
    questionNumber: Number(q.questionNumber),
    title: q.title ?? "",
    questionText: q.questionText,
    options: LITMUS_OPTIONS,  // fixed 1-5 rating options
    isActive: true,
  }));
}

function mapMetacognition(raw: unknown[]): PantheonQuestion[] {
  return raw.map((q: any) => ({
    assessmentCode: "METACOGNITION_TEST",
    category: String(q.domainNumber ?? "1"),
    categoryLabel: q.domain ?? "General",
    questionNumber: Number(q.questionNumber),
    title: q.parameter ?? "",
    questionText: q.questionText,
    options: Array.isArray(q.options)
      ? q.options.map((o: any) => ({ label: o.label, text: o.text, score: o.score }))
      : [],
    isActive: true,
  }));
}

// ─── Upsert helper ────────────────────────────────────────────────────────────
async function upsertQuestions(questions: PantheonQuestion[]): Promise<void> {
  let inserted = 0;
  let updated = 0;
  for (const q of questions) {
    const setDoc: Record<string, unknown> = {
      assessmentCode: q.assessmentCode,
      category: q.category,
      categoryLabel: q.categoryLabel,
      questionNumber: q.questionNumber,
      title: q.title,
      questionText: q.questionText,
      options: q.options,
      isActive: q.isActive,
    };
    if (q.correctAnswer !== undefined) {
      setDoc.correctAnswer = q.correctAnswer;
    }
    const res = await Question.updateOne(
      { assessmentCode: q.assessmentCode, category: q.category, questionNumber: q.questionNumber },
      { $set: setDoc },
      { upsert: true, strict: false }
    );
    if (res.upsertedCount) inserted++;
    else if (res.modifiedCount) updated++;
  }
  console.log(`   ✅ ${inserted} inserted, ${updated} updated`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log("🌱 Connecting to Pantheon MongoDB...");
  await mongoose.connect(MONGODB_URI, { dbName: "Whitelabel" });
  console.log("✅ Connected\n");

  // ── Career Compass ──────────────────────────────────────────────────────────
  console.log("📚 Seeding Career Compass questions...");
  const ccRaw = loadQuestionsFromFile(SOURCE_FILES.CAREER_COMPASS, "personalityQuestions");
  const ccMapped = mapCareerCompass(ccRaw);
  console.log(`   Loaded ${ccMapped.length} questions`);
  await upsertQuestions(ccMapped);

  // ── Career DNA ──────────────────────────────────────────────────────────────
  const careerDnaFiles: Array<{ key: keyof typeof SOURCE_FILES; varName: string; testType: string }> = [
    { key: "CAREER_DNA_APTITUDE", varName: "aptitudeQuestions", testType: "APTITUDE" },
    { key: "CAREER_DNA_BEHAVIORAL", varName: "behavioralSocialQuestions", testType: "BEHAVIORAL_SOCIAL" },
    { key: "CAREER_DNA_CAREER_INTEREST", varName: "careerInterestQuestions", testType: "CAREER_INTEREST" },
    { key: "CAREER_DNA_COGNITIVE", varName: "cognitiveQuestions", testType: "COGNITIVE" },
    { key: "CAREER_DNA_EMOTIONAL", varName: "emotionalIntelligenceQuestions", testType: "EMOTIONAL_INTELLIGENCE" },
    { key: "CAREER_DNA_LEARNING", varName: "learningStyleQuestions", testType: "LEARNING_STYLE" },
    { key: "CAREER_DNA_PERSONALITY", varName: "personalityQuestions", testType: "PERSONALITY" },
    { key: "CAREER_DNA_STRESS", varName: "stressResilienceQuestions", testType: "STRESS_RESILIENCE" },
  ];

  for (const { key, varName, testType } of careerDnaFiles) {
    console.log(`📚 Seeding Career DNA - ${testType}...`);
    const raw = loadQuestionsFromFile(SOURCE_FILES[key], varName);
    const mapped = mapCareerDNA(raw, testType);
    console.log(`   Loaded ${mapped.length} questions`);
    await upsertQuestions(mapped);
  }

  // ── CLEAR ──────────────────────────────────────────────────────────────────
  console.log("📚 Seeding CLEAR questions...");
  const johariRaw = loadQuestionsFromFile(SOURCE_FILES.JOHARI_WINDOW, "johariQuestions");
  const johariMapped = mapJohari(johariRaw);
  console.log(`   Loaded ${johariMapped.length} questions`);
  await upsertQuestions(johariMapped);

  // ── Litmus Test ─────────────────────────────────────────────────────────────
  console.log("📚 Seeding Litmus Test questions...");
  const litmusRaw = loadQuestionsFromFile(SOURCE_FILES.LITMUS_TEST, "questions");
  const litmusMapped = mapLitmus(litmusRaw);
  console.log(`   Loaded ${litmusMapped.length} questions`);
  await upsertQuestions(litmusMapped);

  // ── TEST ───────────────────────────────────────────────────────────────────
  console.log("📚 Seeding TEST questions...");
  const metacogRaw = loadQuestionsFromFile(SOURCE_FILES.METACOGNITION, "questions");
  const metacogMapped = mapMetacognition(metacogRaw);
  console.log(`   Loaded ${metacogMapped.length} questions`);
  await upsertQuestions(metacogMapped);

  // ── Summary ─────────────────────────────────────────────────────────────────
  const total = await Question.countDocuments();
  console.log(`\n🎉 Seeding complete! Total questions in DB: ${total}`);

  await mongoose.disconnect();
  console.log("👋 Disconnected from MongoDB");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
