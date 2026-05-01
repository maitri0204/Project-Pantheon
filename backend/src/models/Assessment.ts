import mongoose, { Document, Schema } from "mongoose";

export interface IAssessment extends Document {
  code: string;
  slug: string;
  name: string;
  category: string;
  summary: string;
  active: boolean;
  basePrice: number;
  currency: string;
  sourceProject: string;
  sourceDbName: string;
  seedCommands: string[];
  evaluationReference: string;
  reportReference: string;
  invoiceReference: string;
  loginReference: string;
  questionBankStatus: "linked" | "pending-import" | "imported";
  questionCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const assessmentSchema = new Schema<IAssessment>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
    basePrice: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    sourceProject: { type: String, required: true },
    sourceDbName: { type: String, required: true },
    seedCommands: { type: [String], default: [] },
    evaluationReference: { type: String, required: true },
    reportReference: { type: String, required: true },
    invoiceReference: { type: String, required: true },
    loginReference: { type: String, required: true },
    questionBankStatus: { type: String, enum: ["linked", "pending-import", "imported"], default: "linked" },
    questionCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IAssessment>("Assessment", assessmentSchema);
