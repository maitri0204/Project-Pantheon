import { Request, Response } from "express";

import Organization from "../models/Organization";
import User, { IUser } from "../models/User";
import { PLATFORM_ORG_SLUG } from "../constants/platform";
import { generateCaptcha, verifyCaptcha } from "../services/captcha";
import { sendOtpEmail } from "../services/email";
import { compareOtp, generateOtp, getOtpExpiry, hashOtp, isOtpExpired } from "../services/otp";
import { signToken } from "../services/token";
import { AuthRequest } from "../types/auth";

const formatUser = (user: IUser) => ({
  id: user._id.toString(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  organizationId: user.organization ? user.organization.toString() : null,
  isVerified: user.isVerified,
});

const validateCaptchaPayload = (captchaToken?: string, captchaAnswer?: string): boolean => {
  if (!captchaToken || typeof captchaAnswer !== "string") {
    return false;
  }

  const numericAnswer = Number(captchaAnswer);
  if (Number.isNaN(numericAnswer)) {
    return false;
  }

  return verifyCaptcha(captchaToken, numericAnswer);
};

export const getCaptchaChallenge = (_req: Request, res: Response): void => {
  res.json({ data: generateCaptcha() });
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      email,
      organizationSlug,
      captchaToken,
      captchaAnswer,
    } = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      organizationSlug?: string;
      captchaToken?: string;
      captchaAnswer?: string;
    };

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      res.status(400).json({ message: "First name, last name, and email are required" });
      return;
    }

    if (!validateCaptchaPayload(captchaToken, captchaAnswer)) {
      res.status(400).json({ message: "Invalid captcha" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const organization = await Organization.findOne({
      slug: (organizationSlug || PLATFORM_ORG_SLUG).toLowerCase().trim(),
      isActive: true,
    });

    if (!organization) {
      res.status(404).json({ message: "Organization not found" });
      return;
    }

    if (!organization.settings.allowSelfSignup) {
      res.status(403).json({ message: "Self signup is disabled for this organization" });
      return;
    }

    const otp = generateOtp();
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      role: "STUDENT",
      organization: organization._id,
      isVerified: false,
      isActive: true,
      otpHash: hashOtp(otp),
      otpExpiresAt: getOtpExpiry(),
      otpPurpose: "SIGNUP",
      otpAttempts: 0,
    });

    await sendOtpEmail({
      email: normalizedEmail,
      firstName: user.firstName,
      otp,
      purpose: "signup",
    });

    res.status(201).json({
      message: "Signup successful. Verify the OTP sent to your email.",
      email: user.email,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Failed to create account" });
  }
};

export const verifySignupOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body as { email?: string; otp?: string };

    if (!email?.trim() || !otp?.trim()) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: "User already verified" });
      return;
    }

    if (user.otpPurpose !== "SIGNUP" || !user.otpHash || isOtpExpired(user.otpExpiresAt)) {
      res.status(400).json({ message: "OTP expired or invalid. Please sign up again." });
      return;
    }

    if (!compareOtp(otp.trim(), user.otpHash)) {
      user.otpAttempts += 1;
      await user.save();
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpPurpose = null;
    user.otpAttempts = 0;
    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      token: signToken(user),
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Verify signup OTP error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, captchaToken, captchaAnswer } = req.body as {
      email?: string;
      captchaToken?: string;
      captchaAnswer?: string;
    };

    if (!email?.trim()) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    if (!validateCaptchaPayload(captchaToken, captchaAnswer)) {
      res.status(400).json({ message: "Invalid captcha" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.isVerified) {
      res.status(400).json({ message: "Account is not verified yet" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ message: "Account is inactive" });
      return;
    }

    const otp = generateOtp();
    user.otpHash = hashOtp(otp);
    user.otpExpiresAt = getOtpExpiry();
    user.otpPurpose = "LOGIN";
    user.otpAttempts = 0;
    await user.save();

    await sendOtpEmail({
      email: user.email,
      firstName: user.firstName,
      otp,
      purpose: "login",
    });

    res.json({ message: "OTP sent to your email", email: user.email });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to send login OTP" });
  }
};

export const verifyLoginOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body as { email?: string; otp?: string };

    if (!email?.trim() || !otp?.trim()) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.otpPurpose !== "LOGIN" || !user.otpHash || isOtpExpired(user.otpExpiresAt)) {
      res.status(400).json({ message: "OTP expired or invalid. Please request a fresh one." });
      return;
    }

    if (!compareOtp(otp.trim(), user.otpHash)) {
      user.otpAttempts += 1;
      await user.save();
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpPurpose = null;
    user.otpAttempts = 0;
    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      token: signToken(user),
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Verify login OTP error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  await req.user.populate("organization");

  res.json({
    user: {
      ...formatUser(req.user),
      organization: req.user.organization,
    },
  });
};
