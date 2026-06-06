/**
 * Seed Script: Resilience Quotient (RQ) Questions
 * 
 * This script imports the ADVERSITY_TEST questions into the MongoDB database
 * when the platform is bootstrapped.
 * 
 * Run: npx ts-node backend/src/scripts/seedAdversityQuestionsScript.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "../models/Question";
import { ADVERSITY_TEST_QUESTIONS } from "./seedAdversityQuestions";

dotenv.config();

const seedAdversityQuestions = async (): Promise<void> => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI/MONGODB_URI not defined in environment variables");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected");

    console.log("📝 Seeding Resilience Quotient (RQ) questions...");

    // Clear existing ADVERSITY_TEST questions to avoid duplicates
    const deleteResult = await Question.deleteMany({
      assessmentCode: "RESILIENCE_TEST",
    });
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing questions`);

    // Insert new questions
    const insertResult = await Question.insertMany(ADVERSITY_TEST_QUESTIONS);
    console.log(`✅ Inserted ${insertResult.length} Resilience Quotient (RQ) questions`);

    // Verify insertion by dimension
    const dimensionCounts = await Promise.all([
      Question.countDocuments({
        assessmentCode: "RESILIENCE_TEST",
        category: "Control",
      }),
      Question.countDocuments({
        assessmentCode: "RESILIENCE_TEST",
        category: "Ownership",
      }),
      Question.countDocuments({
        assessmentCode: "RESILIENCE_TEST",
        category: "Reach",
      }),
      Question.countDocuments({
        assessmentCode: "RESILIENCE_TEST",
        category: "Endurance",
      }),
      Question.countDocuments({
        assessmentCode: "RESILIENCE_TEST",
        category: "Reflection",
      }),
    ]);

    console.log("\n📊 Questions by Dimension:");
    console.log(`  Control:    ${dimensionCounts[0]} questions`);
    console.log(`  Ownership:  ${dimensionCounts[1]} questions`);
    console.log(`  Reach:      ${dimensionCounts[2]} questions`);
    console.log(`  Endurance:  ${dimensionCounts[3]} questions`);
    console.log(`  Reflection: ${dimensionCounts[4]} questions`);
    console.log(`  Total:      ${dimensionCounts.reduce((a: number, b: number) => a + b, 0)} questions`);

    console.log(
      "\n✨ Resilience Quotient (RQ) questions seeded successfully!\n"
    );
  } catch (error) {
    console.error("❌ Error seeding Resilience Quotient (RQ) questions:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
};

// Run the seed if executed directly
if (require.main === module) {
  seedAdversityQuestions().catch(console.error);
}

export default seedAdversityQuestions;
