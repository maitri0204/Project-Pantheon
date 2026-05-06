import mongoose, { Document, Schema } from "mongoose";

export interface IOrganizationCouponUsage extends Document {
  config: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  assessmentCode: string;
  couponCode: string;
  sequence: number;
  attempt?: mongoose.Types.ObjectId;
  usedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const organizationCouponUsageSchema = new Schema<IOrganizationCouponUsage>(
  {
    config: { type: Schema.Types.ObjectId, ref: "OrganizationCouponConfig", required: true, index: true },
    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assessmentCode: { type: String, required: true, uppercase: true, trim: true, index: true },
    couponCode: { type: String, required: true, uppercase: true, trim: true, unique: true },
    sequence: { type: Number, required: true, min: 1 },
    attempt: { type: Schema.Types.ObjectId, ref: "StudentAssessmentAttempt", default: undefined },
    usedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

organizationCouponUsageSchema.index({ organization: 1, user: 1, assessmentCode: 1 }, { unique: true });

export default mongoose.model<IOrganizationCouponUsage>("OrganizationCouponUsage", organizationCouponUsageSchema);
