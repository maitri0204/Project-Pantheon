import mongoose from "mongoose";
import Question from "../models/Question";
import { ALL_ACADEMIC_CAREER_QUESTIONS } from "../data/academicCareerQuestions";

interface RawQuestion {
  questionNumber: number;
  grade: "Grade 8" | "Grade 9" | "Grade 10";
  situation: string;
  questionText: string;
  options: Array<{
    optionKey: "A" | "B" | "C" | "D" | "E";
    optionText: string;
    interestCode: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";
  }>;
}

/**
 * Convert Academic Career questions to Pantheon Question model format
 * Stores the interest code mapping for proper scoring during evaluation
 */
function transformQuestionForPantheon(rawQuestion: RawQuestion) {
  const gradeNum = rawQuestion.grade.split(" ")[1]; // Extract "8", "9", or "10"

  return {
    assessmentCode: "ACADEMIC_CAREER",
    category: `Grade-${gradeNum}`,
    categoryLabel: rawQuestion.grade,
    questionNumber: rawQuestion.questionNumber,
    title: `Q${rawQuestion.questionNumber}: Grade ${gradeNum}`,
    questionText: `Situation: ${rawQuestion.situation}\n\n${rawQuestion.questionText}`,
    options: rawQuestion.options.map((opt) => ({
      label: opt.optionKey,
      text: opt.optionText,
      score: undefined, // Not used for this assessment type
    })),
    // Store full interest code mapping for server-side evaluation
    // Format: {"A": "X", "B": "Y", ...} where keys are option letters, values are interest codes
    correctAnswer: JSON.stringify(
      rawQuestion.options.reduce(
        (map, opt) => {
          map[opt.optionKey] = opt.interestCode;
          return map;
        },
        {} as Record<string, string>
      )
    ),
    isActive: true,
  };
}

/**
 * Main seeding function
 * Imports all Academic Career questions into Pantheon
 */
export async function seedAcademicCareerQuestions() {
  try {
    console.log("🌱 Starting Academic Career & Interest Test question seeding...\n");

    let totalSeeded = 0;

    for (const { grade, questions } of ALL_ACADEMIC_CAREER_QUESTIONS) {
      if (!questions || questions.length === 0) {
        console.warn(`⚠️  No questions found for ${grade}`);
        continue;
      }

      console.log(`📚 Processing ${grade} (${questions.length} questions)...`);

      // Transform questions to Pantheon format
      const transformedQuestions = questions.map((q) => transformQuestionForPantheon(q as RawQuestion));

      // Upsert each question
      let gradeCount = 0;
      for (const q of transformedQuestions) {
        try {
          await Question.updateOne(
            {
              assessmentCode: "ACADEMIC_CAREER",
              category: q.category,
              questionNumber: q.questionNumber,
            },
            { $set: q },
            { upsert: true }
          );
          gradeCount++;
        } catch (error) {
          console.error(`   ❌ Error seeding question ${q.questionNumber}:`, (error as any).message);
        }
      }

      totalSeeded += gradeCount;
      console.log(`   ✅ Seeded ${gradeCount} questions for ${grade}`);
    }

    console.log(`\n✨ Successfully seeded ${totalSeeded} Academic Career questions`);
    console.log("📊 Questions organized by grade:");
    console.log("   - Grade 8: 60 questions");
    console.log("   - Grade 9: 60 questions");
    console.log("   - Grade 10: 60 questions");
    console.log("   - Total: 180 questions\n");

    return totalSeeded;
  } catch (error) {
    console.error("❌ Error seeding Academic Career questions:", error);
    throw error;
  }
}

/**
 * Helper to verify and count seeded questions
 */
export async function verifyAcademicCareerQuestions() {
  try {
    const count = await Question.countDocuments({ assessmentCode: "ACADEMIC_CAREER" });
    const byGrade = await Question.aggregate([
      { $match: { assessmentCode: "ACADEMIC_CAREER" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    console.log(`\n📊 Academic Career Questions Summary:`);
    console.log(`   Total Questions: ${count}`);
    if (byGrade.length > 0) {
      console.log(`   Grade Distribution:`);
      byGrade.forEach((g) => console.log(`     - ${g._id}: ${g.count} questions`));
    }

    return { total: count, byGrade };
  } catch (error) {
    console.error("❌ Error verifying questions:", error);
    throw error;
  }
}

// Export for use in npm scripts
export default seedAcademicCareerQuestions;
