const SAFE_CLIENT_MESSAGE = "Something went wrong. Please try again.";

const SAFE_PATTERNS: Array<{ test: RegExp; message: string }> = [
  { test: /coupon|discount/i, message: "Unable to apply coupon. Please check the code and try again." },
  { test: /payment|razorpay|order/i, message: "Unable to process payment. Please try again." },
  { test: /pricing|amount/i, message: "Unable to calculate pricing. Please try again." },
  { test: /pdf|report|upload/i, message: "Unable to process the report. Please try again." },
  { test: /organization|profile|logo/i, message: "Unable to update organization details. Please try again." },
];

export const toSafeClientErrorMessage = (
  error: unknown,
  fallback = SAFE_CLIENT_MESSAGE,
): string => {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message.trim();
  if (!message) {
    return fallback;
  }

  const matched = SAFE_PATTERNS.find(({ test }) => test.test(message));
  return matched?.message ?? fallback;
};

export const respondWithSafeError = (
  res: import("express").Response,
  status: number,
  error: unknown,
  fallback: string,
  logLabel?: string,
): void => {
  if (logLabel) {
    // eslint-disable-next-line no-console
    console.error(logLabel, error);
  }
  res.status(status).json({ message: toSafeClientErrorMessage(error, fallback) });
};
