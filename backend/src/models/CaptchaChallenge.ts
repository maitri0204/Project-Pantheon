import mongoose, { Document, Schema } from "mongoose";

export interface ICaptchaChallenge extends Document {
  token: string;
  answer: number;
  createdAt: Date;
}

const captchaChallengeSchema = new Schema<ICaptchaChallenge>(
  {
    token: { type: String, required: true, unique: true, index: true },
    answer: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 },
  },
  { timestamps: false },
);

export default mongoose.model<ICaptchaChallenge>("CaptchaChallenge", captchaChallengeSchema);
