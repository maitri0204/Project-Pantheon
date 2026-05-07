import mongoose, { Document, Schema } from "mongoose";

export interface IAssessmentPaymentSession extends Document {
  user: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  assessmentCode: string;
  couponCode?: string;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  gstAmount: number;
  currency: string;
  status: "CREATED" | "PAID" | "CONSUMED" | "FAILED";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  invoice?: mongoose.Types.ObjectId;
  attempt?: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentPaymentSessionSchema = new Schema<IAssessmentPaymentSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    assessmentCode: { type: String, required: true, uppercase: true, trim: true, index: true },
    couponCode: { type: String, default: undefined, uppercase: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, required: true, min: 0, default: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    gstAmount: { type: Number, required: true, min: 0, default: 0 },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["CREATED", "PAID", "CONSUMED", "FAILED"], default: "CREATED", index: true },
    razorpayOrderId: { type: String, default: undefined, index: true },
    razorpayPaymentId: { type: String, default: undefined },
    razorpaySignature: { type: String, default: undefined },
    invoice: { type: Schema.Types.ObjectId, ref: "Invoice", default: undefined },
    attempt: { type: Schema.Types.ObjectId, ref: "StudentAssessmentAttempt", default: undefined },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

assessmentPaymentSessionSchema.index({ user: 1, assessmentCode: 1, status: 1, createdAt: -1 });

export default mongoose.model<IAssessmentPaymentSession>("AssessmentPaymentSession", assessmentPaymentSessionSchema);
