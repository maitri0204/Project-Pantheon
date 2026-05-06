import mongoose, { Document, Schema } from "mongoose";

export interface IOrganizationCouponConfig extends Document {
  organization: mongoose.Types.ObjectId;
  assessmentCode: string;
  prefix: string;
  totalCoupons: number;
  nextSequence: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const organizationCouponConfigSchema = new Schema<IOrganizationCouponConfig>(
  {
    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    assessmentCode: { type: String, required: true, uppercase: true, trim: true, index: true },
    prefix: { type: String, required: true, uppercase: true, trim: true },
    totalCoupons: { type: Number, required: true, min: 1 },
    nextSequence: { type: Number, default: 1, min: 1 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

organizationCouponConfigSchema.index({ organization: 1, assessmentCode: 1 }, { unique: true });

export default mongoose.model<IOrganizationCouponConfig>("OrganizationCouponConfig", organizationCouponConfigSchema);
