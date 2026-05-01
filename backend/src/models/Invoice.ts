import mongoose, { Document, Schema } from "mongoose";

export interface IInvoice extends Document {
  invoiceNumber: string;
  user: mongoose.Types.ObjectId;
  organization?: mongoose.Types.ObjectId;
  assessmentCode: string;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  couponCode?: string;
  status: "DRAFT" | "PAID" | "VOID";
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    organization: { type: Schema.Types.ObjectId, ref: "Organization", default: undefined },
    assessmentCode: { type: String, required: true, uppercase: true },
    amount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    couponCode: { type: String, default: undefined },
    status: { type: String, enum: ["DRAFT", "PAID", "VOID"], default: "DRAFT" },
  },
  { timestamps: true }
);

export default mongoose.model<IInvoice>("Invoice", invoiceSchema);
