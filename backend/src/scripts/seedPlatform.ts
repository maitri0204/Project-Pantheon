import dotenv from "dotenv";

import { connectDB } from "../config/db";
import { bootstrapPlatform } from "../services/bootstrap";

dotenv.config();

const seed = async (): Promise<void> => {
  try {
    await connectDB();
    await bootstrapPlatform();
    console.log("Assessment Centre platform seed completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Assessment Centre platform seed failed:", error);
    process.exit(1);
  }
};

void seed();
