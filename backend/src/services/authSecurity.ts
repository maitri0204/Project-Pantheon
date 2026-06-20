export const MAX_OTP_ATTEMPTS = 5;

export const OTP_REQUEST_SUCCESS_MESSAGE = "If this email is registered, an OTP was sent.";
export const OTP_INVALID_MESSAGE = "OTP expired or invalid. Please request a fresh one.";
export const OTP_TOO_MANY_MESSAGE = "Too many invalid OTP attempts. Please request a new one.";

type OtpLockableDocument = {
  otpAttempts: number;
  otpHash?: string;
  otpExpiresAt?: Date;
  otpPurpose?: string | null;
  save(): Promise<unknown>;
};

export const registerFailedOtpAttempt = async (
  doc: OtpLockableDocument,
): Promise<"invalid" | "locked"> => {
  doc.otpAttempts += 1;

  if (doc.otpAttempts >= MAX_OTP_ATTEMPTS) {
    doc.otpHash = undefined;
    doc.otpExpiresAt = undefined;
    doc.otpPurpose = null;
    await doc.save();
    return "locked";
  }

  await doc.save();
  return "invalid";
};
