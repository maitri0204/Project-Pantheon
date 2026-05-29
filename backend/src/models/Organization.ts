import mongoose, { Document, Schema } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  slug: string;
  website?: string;
  contactEmail?: string;
  type: "PLATFORM" | "WHITELABEL";
  isActive: boolean;
  branding: {
    companyName: string;
    logoUrl?: string;
    primaryColor: string;
    accentColor: string;
  };
  settings: {
    allowSelfSignup: boolean;
    assessmentCatalogVisible: boolean;
    contactPhone?: string;
    representativeName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    website: { type: String, default: undefined, trim: true },
    contactEmail: { type: String, default: undefined, lowercase: true, trim: true },
    type: { type: String, enum: ["PLATFORM", "WHITELABEL"], default: "WHITELABEL" },
    isActive: { type: Boolean, default: true },
    branding: {
      companyName: { type: String, required: true },
      logoUrl: { type: String, default: undefined },
      primaryColor: { type: String, default: "#2563eb" },
      accentColor: { type: String, default: "#06b6d4" },
    },
    settings: {
      allowSelfSignup: { type: Boolean, default: true },
      assessmentCatalogVisible: { type: Boolean, default: true },
      contactPhone: { type: String, default: undefined, trim: true },
      representativeName: { type: String, default: undefined, trim: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrganization>("Organization", organizationSchema);
