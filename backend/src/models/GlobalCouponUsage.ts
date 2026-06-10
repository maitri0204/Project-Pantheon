import mongoose, { Document, Schema } from "mongoose";

export interface IGlobalCouponUsage extends Document {
  coupon: mongoose.Types.ObjectId;
  couponCode: string;
  user: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  assessmentCode: string;
  paymentSession?: mongoose.Types.ObjectId;
  usedAt: Date;
}

const globalCouponUsageSchema = new Schema<IGlobalCouponUsage>(
  {
    coupon: { type: Schema.Types.ObjectId, ref: "Coupon", required: true, index: true },
    couponCode: { type: String, required: true, uppercase: true, trim: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    assessmentCode: { type: String, required: true, uppercase: true, trim: true, index: true },
    paymentSession: { type: Schema.Types.ObjectId, ref: "AssessmentPaymentSession", default: undefined },
    usedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

globalCouponUsageSchema.index({ couponCode: 1, user: 1, assessmentCode: 1 }, { unique: true });

export default mongoose.model<IGlobalCouponUsage>("GlobalCouponUsage", globalCouponUsageSchema);
