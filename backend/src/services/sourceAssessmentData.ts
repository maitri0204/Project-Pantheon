import fs from "fs";
import path from "path";

type RawCareerDnaQuestion = {
  testType: string;
  partNumber: number;
  partName: string;
  questionNumber: number;
  questionText: string;
  passage?: string;
  options: Array<{ label: string; text: string }>;
  correctAnswer: string;
};

const BASE = path.join(__dirname, "../../../../");

const CAREER_DNA_SOURCE_FILES = [
  {
    filePath: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedAptitudeQuestions.ts"),
    arrayVarName: "aptitudeQuestions",
    testType: "APTITUDE",
  },
  {
    filePath: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedBehavioralSocialQuestions.ts"),
    arrayVarName: "behavioralSocialQuestions",
    testType: "BEHAVIORAL_SOCIAL",
  },
  {
    filePath: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedCareerInterestQuestions.ts"),
    arrayVarName: "careerInterestQuestions",
    testType: "CAREER_INTEREST",
  },
  {
    filePath: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedCognitiveQuestions.ts"),
    arrayVarName: "cognitiveQuestions",
    testType: "COGNITIVE",
  },
  {
    filePath: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedEmotionalIntelligenceQuestions.ts"),
    arrayVarName: "emotionalIntelligenceQuestions",
    testType: "EMOTIONAL_INTELLIGENCE",
  },
  {
    filePath: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedLearningStyleQuestions.ts"),
    arrayVarName: "learningStyleQuestions",
    testType: "LEARNING_STYLE",
  },
  {
    filePath: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedPersonalityQuestions.ts"),
    arrayVarName: "personalityQuestions",
    testType: "PERSONALITY",
  },
  {
    filePath: path.join(BASE, "Project-Career_DNA/backend/src/scripts/seedStressResilienceQuestions.ts"),
    arrayVarName: "stressResilienceQuestions",
    testType: "STRESS_RESILIENCE",
  },
] as const;

function stripTypeScript(code: string): string {
  let result = code;

  result = result.replace(/^import\b[^\n]*\n/gm, "");
  result = result.replace(/^dotenv\.[^\n]*\n/gm, "");
  result = result.replace(/^(?:const|let)\s+(?:MONGO_URI|MONGODB_URI)\s*=[^\n]*\n/gm, "");
  result = result.replace(/^if\s*\(\s*!(?:MONGO_URI|MONGODB_URI)[^)]*\)\s*\{[^}]*\}/m, "");
  result = result.replace(/^interface\s+\w+[^\n]*\{[\s\S]*?\n\}/gm, "");
  result = result.replace(/\s+as\s+const\b/g, "");
  result = result.replace(/\s+as\s+[A-Z][a-zA-Z<>, [\]|&]*(?=[,\s)\};\]])/g, "");
  result = result.replace(/:\s*\[\s*(?:string|number|boolean|any)(?:\s*,\s*(?:string|number|boolean|any))*\s*\]/g, "");
  result = result.replace(/^(const\s+\w+)\s*:\s*[A-Z]\w*(?:<[^>]*>)?(?:\[\])?\s*=/gm, "$1 =");
  result = result.replace(/(\w)\s*:\s*(?:number|string|boolean|any|undefined|null)(?:\s*\[\])?(?=\s*[,)=?])/g, "$1");
  result = result.replace(/(\w+)\?:\s*(?:string|number|boolean|any)(?:\s*\[\])?\b/g, "$1");
  result = result.replace(/\)\s*:\s*[A-Z]\w*(?:<[^>]*>)?\s*\{/g, ") {");
  result = result.replace(/\)\s*:\s*(?:void|string|number|boolean|any)\s*\{/g, ") {");
  result = result.replace(/\bconst seed[A-Za-z]+\s*=\s*async[\s\S]*/m, "");
  result = result.replace(/\basync function seed\b[\s\S]*/m, "");
  result = result.replace(/\bfunction seed\b[\s\S]*/m, "");
  result = result.replace(/^seed[A-Za-z]*\(\);?\s*$/gm, "");

  return result;
}

function loadQuestionsFromFile(filePath: string, arrayVarName: string): unknown[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const stripped = stripTypeScript(raw);

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`${stripped}\nreturn typeof ${arrayVarName} !== \"undefined\" ? ${arrayVarName} : [];`);
    const result = fn() as unknown[];
    return Array.isArray(result) ? result : [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("loadQuestionsFromFile: failed to evaluate source file", filePath, err);
    return [];
  }
}

let careerDnaQuestionCache: Map<string, RawCareerDnaQuestion> | null = null;

function buildCareerDnaKey(testType: string, partNumber: number, questionNumber: number) {
  return `${testType}|${partNumber}|${questionNumber}`;
}

export function parseCareerDnaCategory(category: string) {
  const match = String(category || "").match(/^(.*)_(\d+)$/);
  if (!match) {
    return null;
  }

  return {
    testType: match[1],
    partNumber: Number(match[2]),
  };
}

export function getCareerDnaSourceQuestionMap() {
  if (careerDnaQuestionCache) {
    return careerDnaQuestionCache;
  }

  const map = new Map<string, RawCareerDnaQuestion>();

  for (const source of CAREER_DNA_SOURCE_FILES) {
    const questions = loadQuestionsFromFile(source.filePath, source.arrayVarName);
    for (const question of questions as Array<Record<string, unknown>>) {
      const partNumber = Number(question.partNumber ?? 1);
      const questionNumber = Number(question.questionNumber ?? 0);
      if (!questionNumber) {
        continue;
      }

      const normalized: RawCareerDnaQuestion = {
        testType: source.testType,
        partNumber,
        partName: String(question.partName ?? source.testType),
        questionNumber,
        questionText: String(question.questionText ?? ""),
        passage: question.passage ? String(question.passage) : undefined,
        options: Array.isArray(question.options)
          ? (question.options as Array<Record<string, unknown>>).map((option) => ({
              label: String(option.label ?? ""),
              text: String(option.text ?? ""),
            }))
          : [],
        correctAnswer: String(question.correctAnswer ?? ""),
      };

      map.set(buildCareerDnaKey(source.testType, partNumber, questionNumber), normalized);
    }
  }

  careerDnaQuestionCache = map;
  return map;
}

export function getCareerDnaSourceQuestion(testType: string, partNumber: number, questionNumber: number) {
  return getCareerDnaSourceQuestionMap().get(buildCareerDnaKey(testType, partNumber, questionNumber));
 }
