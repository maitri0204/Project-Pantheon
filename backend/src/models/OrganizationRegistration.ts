import mongoose, { Document, Schema } from "mongoose";

export interface IOrganizationRegistration extends Document {
  email: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  designation?: string;
  companyName?: string;
  primaryMobile?: string;
  alternateMobile?: string;
  officeAddress?: string;
  registeredAddress?: string;
  sameAsOfficeAddress?: boolean;
  country?: string;
  state?: string;
  city?: string;
  pinCode?: string;
  legalEntityType?: string;
  cin?: string;
  llpin?: string;
  udyamNumber?: string;
  trustRegistrationNumber?: string;
  gstNumber?: string;
  website?: string;
  panIndividual?: string;
  panCompany?: string;
  tan?: string;
  bankAccountName?: string;
  accountType?: "Saving" | "Current";
  bankAccountNumber?: string;
  ifscCode?: string;
  logoUrl?: string;
  generatedSlug?: string;
  otpHash?: string;
  otpExpiresAt?: Date;
  otpAttempts: number;
  emailVerified: boolean;
  status: "OTP_SENT" | "EMAIL_VERIFIED" | "COMPLETED";
  organization?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const organizationRegistrationSchema = new Schema<IOrganizationRegistration>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    firstName: { type: String, default: undefined, trim: true },
    middleName: { type: String, default: undefined, trim: true },
    lastName: { type: String, default: undefined, trim: true },
    designation: { type: String, default: undefined, trim: true },
    companyName: { type: String, default: undefined, trim: true },
    primaryMobile: { type: String, default: undefined, trim: true },
    alternateMobile: { type: String, default: undefined, trim: true },
    officeAddress: { type: String, default: undefined, trim: true },
    registeredAddress: { type: String, default: undefined, trim: true },
    sameAsOfficeAddress: { type: Boolean, default: false },
    country: { type: String, default: undefined, trim: true },
    state: { type: String, default: undefined, trim: true },
    city: { type: String, default: undefined, trim: true },
    pinCode: { type: String, default: undefined, trim: true },
    legalEntityType: { type: String, default: "Trust", trim: true },
    cin: { type: String, default: undefined, trim: true },
    llpin: { type: String, default: undefined, trim: true },
    udyamNumber: { type: String, default: undefined, trim: true },
    trustRegistrationNumber: { type: String, default: undefined, trim: true },
    gstNumber: { type: String, default: undefined, trim: true },
    website: { type: String, default: undefined, trim: true },
    panIndividual: { type: String, default: undefined, trim: true },
    panCompany: { type: String, default: undefined, trim: true },
    tan: { type: String, default: undefined, trim: true },
    bankAccountName: { type: String, default: undefined, trim: true },
    accountType: { type: String, enum: ["Saving", "Current"], default: undefined },
    bankAccountNumber: { type: String, default: undefined, trim: true },
    ifscCode: { type: String, default: undefined, trim: true },
    logoUrl: { type: String, default: undefined, trim: true },
    generatedSlug: { type: String, default: undefined, trim: true },
    otpHash: { type: String, default: undefined },
    otpExpiresAt: { type: Date, default: undefined },
    otpAttempts: { type: Number, default: 0 },
    emailVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["OTP_SENT", "EMAIL_VERIFIED", "COMPLETED"], default: "OTP_SENT" },
    organization: { type: Schema.Types.ObjectId, ref: "Organization", default: undefined },
  },
  { timestamps: true }
);

export default mongoose.model<IOrganizationRegistration>("OrganizationRegistration", organizationRegistrationSchema);
