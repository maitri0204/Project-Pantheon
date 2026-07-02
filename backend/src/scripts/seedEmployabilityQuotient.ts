import mongoose from "mongoose";
import dotenv from "dotenv";

import Question from "../models/Question";
import {
  EMPLOYABILITY_QUOTIENT_CODE,
  EMPLOYABILITY_QUOTIENT_QUESTIONS,
} from "../data/employabilityQuotientBank";

dotenv.config();

async function seedEmployabilityQuotient(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(mongoUri);

  let upserted = 0;

  for (const question of EMPLOYABILITY_QUOTIENT_QUESTIONS) {
    const options = question.options.map((option) => ({
      label: option.label,
      text: option.text,
      score: option.label === question.correctAnswer ? 1 : 0,
    }));

    await Question.updateOne(
      {
        assessmentCode: EMPLOYABILITY_QUOTIENT_CODE,
        category: question.dimension,
        questionNumber: question.questionNumber,
      },
      {
        $set: {
          assessmentCode: EMPLOYABILITY_QUOTIENT_CODE,
          category: question.dimension,
          categoryLabel: question.dimension,
          questionNumber: question.questionNumber,
          title: question.title,
          questionText: question.questionText,
          options,
          correctAnswer: question.correctAnswer,
          isActive: true,
        },
      },
      { upsert: true },
    );

    upserted += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`Employability Quotient: upserted ${upserted} questions.`);
  await mongoose.disconnect();
}

seedEmployabilityQuotient().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("seedEmployabilityQuotient failed:", error);
  process.exit(1);
});
