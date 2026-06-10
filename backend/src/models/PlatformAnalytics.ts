import mongoose, { Document, Schema } from "mongoose";

export interface IPlatformAnalytics extends Document {
  key: string;
  homePageVisits: number;
  loginPageVisits: number;
}

const platformAnalyticsSchema = new Schema<IPlatformAnalytics>(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    homePageVisits: { type: Number, required: true, default: 0, min: 0 },
    loginPageVisits: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true },
);

export default mongoose.model<IPlatformAnalytics>("PlatformAnalytics", platformAnalyticsSchema);
