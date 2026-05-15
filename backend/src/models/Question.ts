import mongoose, { Document, Schema } from "mongoose";

export interface IQuestionOption {
  label: string;   // "A", "B", "C", "D", "E" or "1"-"5"
  text: string;    // "Always", "Strongly Disagree", etc.
  score?: number;  // numeric score if applicable
}

export interface IQuestion extends Document {
  assessmentCode: string;  // e.g. "LITMUS_TEST", "CAREER_COMPASS"
  category: string;        // e.g. style key "K","S","E","P","J" or section name
  categoryLabel: string;   // Human-readable e.g. "King", "Self-Awareness"
  questionNumber: number;
  title: string;
  questionText: string;
  options: IQuestionOption[];
  correctAnswer?: string;  // correct option label (e.g. "A","B") or dimension key (e.g. "E","S") for Career DNA
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    assessmentCode: { type: String, required: true, uppercase: true, trim: true, index: true },
    category: { type: String, required: true, trim: true },
    categoryLabel: { type: String, required: true, trim: true },
    questionNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    questionText: { type: String, required: true, trim: true },
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
    correctAnswer: { type: String, default: undefined },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

questionSchema.index({ assessmentCode: 1, category: 1, questionNumber: 1 }, { unique: true });

export default mongoose.model<IQuestion>("Question", questionSchema);
