import mongoose, { Document, Schema } from "mongoose";

export type AttemptStatus = "IN_PROGRESS" | "COMPLETED";

export interface IAttemptQuestionOption {
  label: string;
  text: string;
  score?: number;
}

export interface IAttemptQuestion {
  questionId: mongoose.Types.ObjectId;
  questionNumber: number;
  category: string;
  categoryLabel: string;
  questionText: string;
  sourceTestType?: string;
  partNumber?: number;
  passage?: string;
  options: IAttemptQuestionOption[];
  answer?: string;  // stores option label e.g. "A", "B", "1", "2" etc.
}

export interface IStudentAssessmentAttempt extends Document {
  user: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  assessmentCode: string;
  assessmentName: string;
  status: AttemptStatus;
  questions: IAttemptQuestion[];
  answeredCount: number;
  totalQuestions: number;
  evaluation?: Record<string, unknown>;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const attemptQuestionSchema = new Schema<IAttemptQuestion>(
  {
    questionId: { type: Schema.Types.ObjectId, required: true },
    questionNumber: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
    categoryLabel: { type: String, required: true, trim: true },
    questionText: { type: String, required: true, trim: true },
    sourceTestType: { type: String, default: undefined },
    partNumber: { type: Number, default: undefined },
    passage: { type: String, default: undefined },
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
    answer: { type: String, default: undefined },
  },
  { _id: false }
);

const studentAssessmentAttemptSchema = new Schema<IStudentAssessmentAttempt>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    assessmentCode: { type: String, required: true, uppercase: true, trim: true },
    assessmentName: { type: String, required: true, trim: true },
    status: { type: String, enum: ["IN_PROGRESS", "COMPLETED"], default: "IN_PROGRESS" },
    questions: { type: [attemptQuestionSchema], default: [] },
    answeredCount: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    evaluation: { type: Schema.Types.Mixed, default: undefined },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: undefined },
  },
  { timestamps: true }
);

studentAssessmentAttemptSchema.index({ user: 1, assessmentCode: 1 }, { unique: true });

export default mongoose.model<IStudentAssessmentAttempt>(
  "StudentAssessmentAttempt",
  studentAssessmentAttemptSchema
);
