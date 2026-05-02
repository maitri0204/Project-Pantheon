import mongoose, { Document, Schema } from "mongoose";

export interface IStudentRegistrationTemp extends Document {
  organization: mongoose.Types.ObjectId;
  organizationSlug: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: string;
  email: string;
  phone: string;
  phoneCode?: string;
  institutionName?: string;
  grade?: string;
  country?: string;
  state?: string;
  city?: string;
  otpHash: string;
  otpExpiresAt: Date;
  otpAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const studentRegistrationTempSchema = new Schema<IStudentRegistrationTemp>(
  {
    organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    organizationSlug: { type: String, required: true, lowercase: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, default: undefined, trim: true },
    lastName: { type: String, required: true, trim: true },
    gender: { type: String, default: undefined, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    phoneCode: { type: String, default: "+91", trim: true },
    institutionName: { type: String, default: undefined, trim: true },
    grade: { type: String, default: undefined, trim: true },
    country: { type: String, default: undefined, trim: true },
    state: { type: String, default: undefined, trim: true },
    city: { type: String, default: undefined, trim: true },
    otpHash: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
    otpAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Expire exactly at otpExpiresAt (set to now + 5 minutes on each registration request).
studentRegistrationTempSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });
studentRegistrationTempSchema.index({ email: 1 }, { unique: true });

export default mongoose.model<IStudentRegistrationTemp>(
  "StudentRegistrationTemp",
  studentRegistrationTempSchema
);
