import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Question from "../models/Question";

dotenv.config();

const EXTERNAL_STUDY_ABROAD_SOURCE =
  process.env.STUDY_ABROAD_QUESTIONS_SOURCE
  || "/Users/maitripatel/Downloads/Study-Abroad/frontend/src/lib/question-bank.ts";

type ExternalBankQuestion = {
  id: number;
  topic: string;
  text: string;
  options: Array<{ text: string; score: number }>;
};

type PantheonStudyAbroadQuestion = {
  assessmentCode: "STUDY_ABROAD";
  category: string;
  categoryLabel: string;
  questionNumber: number;
  title: string;
  questionText: string;
  options: Array<{ label: string; text: string; score: number }>;
  isActive: boolean;
};

const OPTION_LABELS = ["A", "B", "C", "D"];

const transformQuestion = (question: ExternalBankQuestion): PantheonStudyAbroadQuestion => ({
  assessmentCode: "STUDY_ABROAD",
  category: question.topic,
  categoryLabel: question.topic,
  questionNumber: question.id,
  title: `Q${question.id}`,
  questionText: question.text,
  options: question.options.map((option, index) => ({
    label: OPTION_LABELS[index] || String(index + 1),
    text: option.text,
    score: option.score,
  })),
  isActive: true,
});

const loadExternalQuestions = (): ExternalBankQuestion[] | null => {
  try {
    if (!fs.existsSync(EXTERNAL_STUDY_ABROAD_SOURCE)) {
      return null;
    }

    const raw = fs.readFileSync(EXTERNAL_STUDY_ABROAD_SOURCE, "utf8");
    const startMarker = "export const QUESTION_BANK: BankQuestion[] = [";
    const startIndex = raw.indexOf(startMarker);
    if (startIndex < 0) {
      return null;
    }

    const endIndex = raw.indexOf("\n];", startIndex);
    if (endIndex < 0) {
      return null;
    }

    const arraySource = raw.slice(startIndex + startMarker.length - 1, endIndex + 2);
    // eslint-disable-next-line no-new-func
    const loaded = new Function(`return ${arraySource};`)();
    if (!Array.isArray(loaded)) {
      return null;
    }

    return loaded as ExternalBankQuestion[];
  } catch (error) {
    console.warn(
      `Failed to load Study-Abroad source from ${path.basename(EXTERNAL_STUDY_ABROAD_SOURCE)}.`,
      error
    );
    return null;
  }
};

export async function seedStudyAbroadQuestions(): Promise<number> {
  const external = loadExternalQuestions();
  if (!external?.length) {
    throw new Error(
      `No Study-Abroad questions found. Set STUDY_ABROAD_QUESTIONS_SOURCE or place the repo at ${EXTERNAL_STUDY_ABROAD_SOURCE}`
    );
  }

  let seeded = 0;
  for (const question of external) {
    const payload = transformQuestion(question);
    await Question.updateOne(
      {
        assessmentCode: "STUDY_ABROAD",
        category: payload.category,
        questionNumber: payload.questionNumber,
      },
      { $set: payload },
      { upsert: true }
    );
    seeded += 1;
  }

  return seeded;
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(mongoUri);
  const count = await seedStudyAbroadQuestions();
  console.log(`Seeded ${count} Study Abroad questions.`);
  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
