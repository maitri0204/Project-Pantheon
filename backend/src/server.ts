import dotenv from "dotenv";
import path from "path";

import app from "./app";
import { connectDB } from "./config/db";
import { bootstrapPlatform } from "./services/bootstrap";

// Load .env relative to this file's location so it works regardless of process CWD
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const PORT = Number(process.env.PORT) || 5014;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    await bootstrapPlatform();

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

void startServer();
