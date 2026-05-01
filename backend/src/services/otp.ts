import bcrypt from "bcryptjs";
import crypto from "crypto";

export const generateOtp = (length = 6): string => {
  let otp = "";
  for (let index = 0; index < length; index += 1) {
    otp += crypto.randomInt(0, 10).toString();
  }
  return otp;
};

export const hashOtp = (otp: string): string => bcrypt.hashSync(otp, 10);
export const compareOtp = (otp: string, hash: string): boolean => bcrypt.compareSync(otp, hash);
export const getOtpExpiry = (minutes = 10): Date => new Date(Date.now() + minutes * 60 * 1000);
export const isOtpExpired = (value?: Date): boolean => !value || new Date() > new Date(value);
