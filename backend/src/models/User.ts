import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "SUPERADMIN" | "ORG_ADMIN" | "STUDENT" | "PARENT";
export type OtpPurpose = "SIGNUP" | "LOGIN" | null;

export interface IUser extends Document {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: UserRole;
  organization?: mongoose.Types.ObjectId;
  gender?: string;
  phone?: string;
  phoneCode?: string;
  grade?: string;
  country?: string;
  state?: string;
  city?: string;
  institutionName?: string;
  division?: string;
  isVerified: boolean;
  isActive: boolean;
  otpHash?: string;
  otpExpiresAt?: Date;
  otpPurpose?: OtpPurpose;
  otpAttempts: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, default: undefined, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ["SUPERADMIN", "ORG_ADMIN", "STUDENT", "PARENT"], default: "STUDENT" },
    organization: { type: Schema.Types.ObjectId, ref: "Organization", default: undefined },
    gender: { type: String, default: undefined },
    phone: { type: String, default: undefined },
    phoneCode: { type: String, default: undefined },
    grade: { type: String, default: undefined },
    country: { type: String, default: undefined },
    state: { type: String, default: undefined },
    city: { type: String, default: undefined },
    institutionName: { type: String, default: undefined },
    division: { type: String, default: undefined, trim: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    otpHash: { type: String, default: undefined },
    otpExpiresAt: { type: Date, default: undefined },
    otpPurpose: { type: String, enum: ["SIGNUP", "LOGIN", null], default: null },
    otpAttempts: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: undefined },
  },
  { timestamps: true }
);

userSchema.index({ organization: 1, role: 1 });

export default mongoose.model<IUser>("User", userSchema);
