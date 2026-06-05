/**
 * Validates critical environment variables at server startup.
 * Ensures required services can be initialized with proper configuration.
 */

export const validateEnvironmentVariables = (): void => {
  const isProduction = process.env.NODE_ENV === "production";

  const requiredEnvVars = ["MONGODB_URI", "DB_NAME", "JWT_SECRET"];

  const productionOnlyEnvVars = [
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASS",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
  ];

  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  if (isProduction) {
    missingEnvVars.push(...productionOnlyEnvVars.filter((envVar) => !process.env[envVar]));
  }

  if (missingEnvVars.length > 0) {
    console.error(
      "❌ STARTUP ERROR: Missing required environment variables:\n" +
        missingEnvVars.map((v) => `  - ${v}`).join("\n") +
        "\n\nPlease configure these variables in .env file and restart the server."
    );
    process.exit(1);
  }

  if (!isProduction) {
    productionOnlyEnvVars.forEach((name) => {
      if (!process.env[name]) {
        console.warn(`⚠️  Optional in development: ${name} is not set`);
      }
    });
  }

  // Warn about optional but important env vars
  const optionalImportantVars = [
    { name: "FRONTEND_URL", suggestion: "Used for CORS and OAuth redirects" },
    { name: "MAIN_DOMAIN", suggestion: "Used for CORS hostname validation" },
  ];

  optionalImportantVars.forEach(({ name, suggestion }) => {
    if (!process.env[name]) {
      console.warn(`⚠️  Optional environment variable not set: ${name} (${suggestion})`);
    }
  });

  // Validate critical env vars have reasonable values
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    console.warn("⚠️  JWT_SECRET is very short. Recommended minimum length is 16 characters.");
  }

  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith("mongodb")) {
    console.warn("⚠️  MONGODB_URI does not start with 'mongodb'. Verify the connection string is correct.");
  }
};
