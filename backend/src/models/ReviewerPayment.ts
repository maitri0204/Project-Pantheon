import mongoose, { Document, Schema } from "mongoose";

export interface IReviewerPayment extends Document {
  user: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: "CREATED" | "PAID" | "FAILED";
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reviewerPaymentSchema = new Schema<IReviewerPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, default: undefined },
    razorpaySignature: { type: String, default: undefined },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["CREATED", "PAID", "FAILED"], default: "CREATED", index: true },
    verifiedAt: { type: Date, default: undefined },
  },
  { timestamps: true }
);

export default mongoose.model<IReviewerPayment>("ReviewerPayment", reviewerPaymentSchema);
