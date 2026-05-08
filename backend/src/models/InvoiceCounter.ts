import mongoose, { Document, Schema } from "mongoose";

export interface IInvoiceCounter extends Document {
  organization: mongoose.Types.ObjectId;
  financialYear: string; // e.g. "2026-27"
  counter: number;
}

const invoiceCounterSchema = new Schema<IInvoiceCounter>(
  {
    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    financialYear: { type: String, required: true, index: true },
    counter: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

invoiceCounterSchema.index({ organization: 1, financialYear: 1 }, { unique: true });

export default mongoose.model<IInvoiceCounter>("InvoiceCounter", invoiceCounterSchema);
