import mongoose, { Document, Schema } from "mongoose";

export interface IQuestion extends Document {
  assessmentCode: string;  // e.g. "LITMUS_TEST", "CAREER_COMPASS"
  category: string;        // e.g. style key "K","S","E","P","J" or section name
  categoryLabel: string;   // Human-readable e.g. "King", "Self-Awareness"
  questionNumber: number;
  title: string;
  questionText: string;
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
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

questionSchema.index({ assessmentCode: 1, category: 1, questionNumber: 1 }, { unique: true });

export default mongoose.model<IQuestion>("Question", questionSchema);
