import { Request, Response } from "express";

import Organization from "../models/Organization";
import OrganizationRegistration from "../models/OrganizationRegistration";
import StudentRegistrationTemp from "../models/StudentRegistrationTemp";
import User, { IUser } from "../models/User";
import { PLATFORM_ORG_SLUG, REVIEWER_EMAIL, REVIEWER_NAME } from "../constants/platform";
import { generateCaptcha, verifyCaptcha } from "../services/captcha";
import { sendOtpEmail, sendRegistrationConfirmationEmail } from "../services/email";
import { isAllowedOrganizationWebsite } from "../services/websiteValidation";
import { compareOtp, generateOtp, getOtpExpiry, hashOtp, isOtpExpired } from "../services/otp";
import { isBase64ImageWithinLimit } from "../services/uploadValidation";
import {
  decryptRegistrationSensitiveFields,
  encryptRegistrationSensitiveFields,
} from "../services/sensitiveData";
import {
  MAX_OTP_ATTEMPTS,
  OTP_INVALID_MESSAGE,
  OTP_REQUEST_SUCCESS_MESSAGE,
  OTP_TOO_MANY_MESSAGE,
  registerFailedOtpAttempt,
} from "../services/authSecurity";
import { signToken } from "../services/token";
import { clearAuthCookie, setAuthCookie } from "../services/authCookie";
import { AuthRequest } from "../types/auth";

const formatUser = (user: IUser) => ({
  id: user._id.toString(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  organizationId: user.organization ? user.organization.toString() : null,
  orgSlug:
    typeof user.organization === "object" && user.organization && "slug" in user.organization
      ? (user.organization as { slug?: string }).slug || null
      : null,
  isVerified: user.isVerified,
  grade: user.grade,
  institutionName: user.institutionName,
  division: user.division,
  phone: user.phone,
  phoneCode: user.phoneCode,
});

const issueAuthSession = (
  res: Response,
  user: IUser,
  extra: Record<string, unknown> = {},
): void => {
  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({
    token,
    user: formatUser(user),
    ...extra,
  });
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  clearAuthCookie(res);
  res.json({ message: "Logged out successfully" });
};

const validateCaptchaPayload = async (captchaToken?: string, captchaAnswer?: string): Promise<boolean> => {
  if (!captchaToken || typeof captchaAnswer !== "string") {
    return false;
  }

  const numericAnswer = Number(captchaAnswer);
  if (Number.isNaN(numericAnswer)) {
    return false;
  }

  return verifyCaptcha(captchaToken, numericAnswer);
};

const MAX_LOGIN_OTP_ATTEMPTS = MAX_OTP_ATTEMPTS;

const formatOrganizationSummary = (organization: unknown) => {
  if (!organization || typeof organization !== "object") {
    return null;
  }

  const org = organization as {
    _id?: { toString?: () => string };
    name?: string;
    slug?: string;
    type?: string;
    website?: string;
    contactEmail?: string;
    branding?: {
      companyName?: string;
      logoUrl?: string;
      primaryColor?: string;
      accentColor?: string;
    };
    settings?: {
      allowSelfSignup?: boolean;
    };
  };

  return {
    id: org._id && typeof org._id.toString === "function" ? org._id.toString() : undefined,
    name: org.name,
    slug: org.slug,
    type: org.type,
    website: org.website,
    contactEmail: org.contactEmail,
    branding: org.branding
      ? {
          companyName: org.branding.companyName,
          logoUrl: org.branding.logoUrl,
          primaryColor: org.branding.primaryColor,
          accentColor: org.branding.accentColor,
        }
      : undefined,
    settings: org.settings
      ? {
          allowSelfSignup: org.settings.allowSelfSignup,
        }
      : undefined,
  };
};

export const getCaptchaChallenge = async (_req: Request, res: Response): Promise<void> => {
  res.json({ data: await generateCaptcha() });
};

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/https?:\/\//g, "")
    .replace(/www\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 50);

const getUniqueOrganizationSlug = async (seed: string): Promise<string> => {
  const base = slugify(seed) || "organization";
  let candidate = base;
  let counter = 1;

  while (await Organization.findOne({ slug: candidate })) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }

  return candidate;
};

const normalizeUrlBase = (value: string): string => value.trim().replace(/\/+$/, "");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-\s]{7,20}$/;
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const isValidEmail = (value?: string): boolean => {
  const email = String(value || "").trim();
  return EMAIL_PATTERN.test(email);
};

const isValidPhoneNumber = (value?: string): boolean => {
  const phone = String(value || "").trim();
  return PHONE_PATTERN.test(phone);
};

const isValidIfscCode = (value?: string): boolean => {
  const ifsc = String(value || "").trim().toUpperCase();
  return IFSC_PATTERN.test(ifsc);
};

const isValidOrganizationSlug = (value?: string): boolean => {
  const slug = String(value || "").toLowerCase().trim();
  if (!slug) {
    return false;
  }

  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};

const getPortalLoginLink = ({
  website,
  orgSlug,
  frontendBaseUrl,
}: {
  website?: string;
  orgSlug: string;
  frontendBaseUrl: string;
}): string => {
  const encodedSlug = encodeURIComponent(orgSlug);

  if (website?.trim()) {
    const raw = website.trim();
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

    try {
      const parsed = new URL(candidate);
      const path = parsed.pathname.replace(/\/+$/, "");
      if (path && path !== "/") {
        return `${parsed.origin}${path}/login`;
      }
      return `${parsed.origin}/login`;
    } catch (err) {
      // Log and fall back to platform-hosted portal login URL
      // eslint-disable-next-line no-console
      console.warn("getPortalLoginLink: failed to parse website URL", err, candidate);
    }
  }

  const base = normalizeUrlBase(frontendBaseUrl);
  return `${base}/whitelabel/${encodedSlug}/login`;
};

const getUserOrganization = (user: Awaited<ReturnType<typeof User.findOne>>) => {
  const organization = user?.organization as
    | {
        _id: { toString(): string };
        slug: string;
        type: "PLATFORM" | "WHITELABEL";
      }
    | undefined;

  return organization;
};

const validateWhitelabelLoginContext = ({
  user,
  organizationSlug,
}: {
  user: Awaited<ReturnType<typeof User.findOne>>;
  organizationSlug?: string;
}): { allowed: true } | { allowed: false; status: number; message: string } => {
  const normalizedOrganizationSlug = organizationSlug?.toLowerCase().trim();

  if (normalizedOrganizationSlug && !isValidOrganizationSlug(normalizedOrganizationSlug)) {
    return {
      allowed: false,
      status: 400,
      message: "Invalid organization portal identifier",
    };
  }

  const organization = getUserOrganization(user);
  const isWhitelabelMember =
    Boolean(organization) &&
    organization?.type === "WHITELABEL" &&
    (user?.role === "ORG_ADMIN" || user?.role === "STUDENT" || user?.role === "PARENT");

  if (normalizedOrganizationSlug) {
    if (user?.role === "SUPERADMIN") {
      return {
        allowed: false,
        status: 403,
        message: "You cannot log in from an organization whitelabel portal",
      };
    }

    if (!isWhitelabelMember) {
      return {
        allowed: false,
        status: 403,
        message: "This portal login is only for whitelabel organization users",
      };
    }

    if (!organization || organization.slug !== normalizedOrganizationSlug) {
      return {
        allowed: false,
        status: 403,
        message: "This email is not registered under this organization portal",
      };
    }

    return { allowed: true };
  }

  return { allowed: true };
};

export const requestRegistrationOtp = async (req: Request, res: Response): Promise<void> => {
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

    if (!isValidEmail(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    if (!(await validateCaptchaPayload(captchaToken, captchaAnswer))) {
      res.status(400).json({ message: "Invalid captcha" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.json({ message: OTP_REQUEST_SUCCESS_MESSAGE, email: normalizedEmail });
      return;
    }

    const otp = generateOtp();
    const registration = await OrganizationRegistration.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          email: normalizedEmail,
          otpHash: hashOtp(otp),
          otpExpiresAt: getOtpExpiry(),
          otpAttempts: 0,
          emailVerified: false,
          status: "OTP_SENT",
        },
      },
      { returnDocument: "after", upsert: true }
    );

    await sendOtpEmail({
      email: normalizedEmail,
      firstName: registration.firstName || "Partner",
      otp,
      purpose: "registration",
    });

    res.json({ message: OTP_REQUEST_SUCCESS_MESSAGE, email: normalizedEmail });
  } catch (error) {
    console.error("Request registration OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyRegistrationOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body as { email?: string; otp?: string };

    if (!email?.trim() || !otp?.trim()) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    const registration = await OrganizationRegistration.findOne({ email: email.toLowerCase().trim() });
    if (!registration) {
      res.status(400).json({ message: OTP_INVALID_MESSAGE });
      return;
    }

    if (!registration.otpHash || isOtpExpired(registration.otpExpiresAt)) {
      res.status(400).json({ message: OTP_INVALID_MESSAGE });
      return;
    }

    if (!compareOtp(otp.trim(), registration.otpHash)) {
      const result = await registerFailedOtpAttempt(registration);
      if (result === "locked") {
        res.status(429).json({ message: OTP_TOO_MANY_MESSAGE });
        return;
      }
      res.status(400).json({ message: OTP_INVALID_MESSAGE });
      return;
    }

    registration.emailVerified = true;
    registration.status = "EMAIL_VERIFIED";
    registration.otpHash = undefined;
    registration.otpExpiresAt = undefined;
    registration.otpAttempts = 0;
    await registration.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify registration OTP error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

export const completeOrganizationRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as {
      email?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      designation?: string;
      companyName?: string;
      primaryMobile?: string;
      alternateMobile?: string;
      officeAddress?: string;
      registeredAddress?: string;
      sameAsOfficeAddress?: boolean;
      country?: string;
      state?: string;
      city?: string;
      pinCode?: string;
      legalEntityType?: string;
      cin?: string;
      llpin?: string;
      udyamNumber?: string;
      trustRegistrationNumber?: string;
      gstNumber?: string;
      website?: string;
      panIndividual?: string;
      panCompany?: string;
      tan?: string;
      bankAccountName?: string;
      accountType?: "Saving" | "Current";
      bankAccountNumber?: string;
      ifscCode?: string;
      logoUrl?: string;
      signatureUrl?: string;
    };

    const normalizedEmail = body.email?.toLowerCase().trim();
    if (!normalizedEmail) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    const registration = await OrganizationRegistration.findOne({ email: normalizedEmail });
    if (!registration || !registration.emailVerified) {
      res.status(400).json({ message: "Verify email before submitting organization details" });
      return;
    }

    if (registration.status === "COMPLETED") {
      res.status(409).json({ message: "Organization registration is already complete. Please log in." });
      return;
    }

    if (await User.findOne({ email: normalizedEmail })) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    if (!body.firstName?.trim() || !body.lastName?.trim() || !body.companyName?.trim()) {
      res.status(400).json({ message: "First name, last name, and company name are required" });
      return;
    }

    if (!body.designation?.trim() || !body.primaryMobile?.trim()) {
      res.status(400).json({ message: "Designation and primary mobile are required" });
      return;
    }

    if (!isValidPhoneNumber(body.primaryMobile)) {
      res.status(400).json({ message: "Invalid primary mobile number" });
      return;
    }

    if (!body.officeAddress?.trim() || !body.registeredAddress?.trim()) {
      res.status(400).json({ message: "Office and registered address are required" });
      return;
    }

    if (!body.country?.trim() || !body.state?.trim() || !body.city?.trim() || !body.pinCode?.trim()) {
      res.status(400).json({ message: "Country, state, city, and PIN code are required" });
      return;
    }

    if (!body.panIndividual?.trim() || !body.panCompany?.trim() || !body.bankAccountName?.trim()) {
      res.status(400).json({ message: "PAN and bank account details are required" });
      return;
    }

    if (!body.bankAccountNumber?.trim() || !body.ifscCode?.trim() || !body.accountType) {
      res.status(400).json({ message: "Bank account number, IFSC code, and account type are required" });
      return;
    }

    if (!isValidIfscCode(body.ifscCode)) {
      res.status(400).json({ message: "Invalid IFSC code" });
      return;
    }

    if (body.alternateMobile?.trim() && !isValidPhoneNumber(body.alternateMobile)) {
      res.status(400).json({ message: "Invalid alternate mobile number" });
      return;
    }

    if (!body.signatureUrl?.trim()) {
      res.status(400).json({ message: "Signature is required" });
      return;
    }

    if (body.logoUrl?.trim().startsWith("data:image/") && !isBase64ImageWithinLimit(body.logoUrl.trim())) {
      res.status(400).json({ message: "Logo file is too large. Maximum size is 500KB." });
      return;
    }

    if (body.signatureUrl.trim().startsWith("data:image/") && !isBase64ImageWithinLimit(body.signatureUrl.trim())) {
      res.status(400).json({ message: "Signature file is too large. Maximum size is 500KB." });
      return;
    }

    const websiteValue = body.website?.trim() || "";
    if (websiteValue && !isAllowedOrganizationWebsite(websiteValue)) {
      res.status(400).json({
        message: "Website must be a valid subdomain of the platform domain or localhost for testing.",
      });
      return;
    }

    const legalEntityType = "Trust";
    const slugSeed = body.companyName;
    const orgSlug = await getUniqueOrganizationSlug(slugSeed);
    const requiresApproval = process.env.NODE_ENV === "production"
      ? process.env.ORG_REGISTRATION_REQUIRES_APPROVAL !== "false"
      : process.env.ORG_REGISTRATION_REQUIRES_APPROVAL === "true";
    const isActive = !requiresApproval;

    const organization = await Organization.create({
      name: body.companyName.trim(),
      slug: orgSlug,
      website: body.website?.trim() || undefined,
      contactEmail: normalizedEmail,
      type: "WHITELABEL",
      isActive,
      branding: {
        companyName: body.companyName.trim(),
        logoUrl: body.logoUrl?.trim() || undefined,
        primaryColor: "#2563eb",
        accentColor: "#06b6d4",
      },
      settings: {
        allowSelfSignup: false,
        assessmentCatalogVisible: true,
      },
    });

    const user = await User.create({
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: normalizedEmail,
      role: "ORG_ADMIN",
      organization: organization._id,
      isVerified: true,
      isActive,
      otpHash: undefined,
      otpExpiresAt: undefined,
      otpPurpose: null,
      otpAttempts: 0,
      lastLoginAt: new Date(),
    });

    registration.firstName = body.firstName?.trim();
    registration.middleName = body.middleName?.trim();
    registration.lastName = body.lastName?.trim();
    registration.designation = body.designation?.trim();
    registration.companyName = body.companyName?.trim();
    registration.primaryMobile = body.primaryMobile?.trim();
    registration.alternateMobile = body.alternateMobile?.trim();
    registration.officeAddress = body.officeAddress?.trim();
    registration.registeredAddress = body.registeredAddress?.trim();
    registration.sameAsOfficeAddress = Boolean(body.sameAsOfficeAddress);
    registration.country = body.country?.trim();
    registration.state = body.state?.trim();
    registration.city = body.city?.trim();
    registration.pinCode = body.pinCode?.trim();
    registration.legalEntityType = legalEntityType;
    registration.cin = body.cin?.trim();
    registration.llpin = body.llpin?.trim();
    registration.udyamNumber = body.udyamNumber?.trim();
    registration.trustRegistrationNumber = body.trustRegistrationNumber?.trim();
    registration.gstNumber = body.gstNumber?.trim();
    registration.website = body.website?.trim();
    const encryptedSensitiveFields = encryptRegistrationSensitiveFields({
      panIndividual: body.panIndividual?.trim(),
      panCompany: body.panCompany?.trim(),
      bankAccountName: body.bankAccountName?.trim(),
      bankAccountNumber: body.bankAccountNumber?.trim(),
      ifscCode: body.ifscCode?.trim(),
    });
    registration.panIndividual = encryptedSensitiveFields.panIndividual;
    registration.panCompany = encryptedSensitiveFields.panCompany;
    registration.tan = body.tan?.trim();
    registration.bankAccountName = encryptedSensitiveFields.bankAccountName;
    registration.accountType = body.accountType;
    registration.bankAccountNumber = encryptedSensitiveFields.bankAccountNumber;
    registration.ifscCode = encryptedSensitiveFields.ifscCode;
    registration.logoUrl = body.logoUrl?.trim();
    registration.signatureUrl = body.signatureUrl?.trim();
    registration.generatedSlug = orgSlug;
    registration.status = "COMPLETED";
    registration.organization = organization._id;
    await registration.save();

    // Construct the website link and login URL
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const websiteLink = getPortalLoginLink({
      website: body.website?.trim(),
      orgSlug,
      frontendBaseUrl: baseUrl,
    });

    // Send registration confirmation email
    try {
      await sendRegistrationConfirmationEmail({
        email: normalizedEmail,
        firstName: body.firstName.trim(),
        companyName: body.companyName.trim(),
        websiteLink,
        loginEmail: normalizedEmail,
      });
    } catch (emailError) {
      console.error("Failed to send registration confirmation email:", emailError);
      // Don't fail the registration if email fails, just log it
    }

    if (requiresApproval) {
      res.status(201).json({
        message: "Organization registration submitted for approval. You will receive an email once approved.",
        pendingApproval: true,
        organization: {
          id: organization._id,
          slug: organization.slug,
          name: organization.name,
          website: organization.website,
          logoUrl: organization.branding.logoUrl,
        },
      });
      return;
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    res.status(201).json({
      message: "Organization registration completed",
      pendingApproval: false,
      token,
      user: formatUser(user),
      organization: {
        id: organization._id,
        slug: organization.slug,
        name: organization.name,
        website: organization.website,
        logoUrl: organization.branding.logoUrl,
      },
    });
  } catch (error) {
    console.error("Complete organization registration error:", error);
    res.status(500).json({ message: "Failed to complete registration" });
  }
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

    if (!isValidEmail(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    if (!(await validateCaptchaPayload(captchaToken, captchaAnswer))) {
      res.status(400).json({ message: "Invalid captcha" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(201).json({
        message: "Signup successful. Verify the OTP sent to your email.",
        email: normalizedEmail,
      });
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
      res.status(400).json({ message: OTP_INVALID_MESSAGE });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: OTP_INVALID_MESSAGE });
      return;
    }

    if (user.otpPurpose !== "SIGNUP" || !user.otpHash || isOtpExpired(user.otpExpiresAt)) {
      res.status(400).json({ message: OTP_INVALID_MESSAGE });
      return;
    }

    if (!compareOtp(otp.trim(), user.otpHash)) {
      const result = await registerFailedOtpAttempt(user);
      if (result === "locked") {
        res.status(429).json({ message: OTP_TOO_MANY_MESSAGE });
        return;
      }
      res.status(400).json({ message: OTP_INVALID_MESSAGE });
      return;
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpPurpose = null;
    user.otpAttempts = 0;
    user.lastLoginAt = new Date();
    await user.save();

    issueAuthSession(res, user);
  } catch (error) {
    console.error("Verify signup OTP error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, captchaToken, captchaAnswer, organizationSlug } = req.body as {
      email?: string;
      captchaToken?: string;
      captchaAnswer?: string;
      organizationSlug?: string;
    };

    if (!email?.trim()) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    if (!(await validateCaptchaPayload(captchaToken, captchaAnswer))) {
      res.status(400).json({ message: "Invalid captcha" });
      return;
    }

    if (organizationSlug && !isValidOrganizationSlug(organizationSlug)) {
      res.status(400).json({ message: "Invalid organization identifier" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate("organization");
    if (!user) {
      res.json({ message: OTP_REQUEST_SUCCESS_MESSAGE, email: email.toLowerCase().trim() });
      return;
    }

    if (!user.isVerified) {
      res.json({ message: OTP_REQUEST_SUCCESS_MESSAGE, email: email.toLowerCase().trim() });
      return;
    }

    if (!user.isActive) {
      res.json({ message: OTP_REQUEST_SUCCESS_MESSAGE, email: email.toLowerCase().trim() });
      return;
    }

    const contextValidation = validateWhitelabelLoginContext({ user, organizationSlug });
    if (!contextValidation.allowed) {
      res.status(contextValidation.status).json({ message: contextValidation.message });
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

    res.json({ message: OTP_REQUEST_SUCCESS_MESSAGE, email: user.email });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to send login OTP" });
  }
};

export const verifyLoginOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, organizationSlug } = req.body as {
      email?: string;
      otp?: string;
      organizationSlug?: string;
    };

    if (!email?.trim() || !otp?.trim()) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    if (organizationSlug && !isValidOrganizationSlug(organizationSlug)) {
      res.status(400).json({ message: "Invalid organization identifier" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate("organization");
    if (!user) {
      res.status(400).json({ message: OTP_INVALID_MESSAGE });
      return;
    }

    const contextValidation = validateWhitelabelLoginContext({ user, organizationSlug });
    if (!contextValidation.allowed) {
      res.status(contextValidation.status).json({ message: contextValidation.message });
      return;
    }

    if (user.otpPurpose !== "LOGIN" || !user.otpHash || isOtpExpired(user.otpExpiresAt)) {
      res.status(400).json({ message: OTP_INVALID_MESSAGE });
      return;
    }

    if (!compareOtp(otp.trim(), user.otpHash)) {
      const result = await registerFailedOtpAttempt(user);
      if (result === "locked") {
        res.status(429).json({ message: OTP_TOO_MANY_MESSAGE });
        return;
      }
      res.status(400).json({ message: OTP_INVALID_MESSAGE });
      return;
    }

    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpPurpose = null;
    user.otpAttempts = 0;
    user.lastLoginAt = new Date();
    await user.save();

    issueAuthSession(res, user, {
      orgSlug:
        typeof user.organization === "object" && user.organization && "slug" in user.organization
          ? (user.organization as { slug?: string }).slug || null
          : null,
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
      organization: formatOrganizationSummary(req.user.organization),
    },
    orgSlug:
      typeof req.user.organization === "object" && req.user.organization && "slug" in req.user.organization
        ? (req.user.organization as { slug?: string }).slug || null
        : null,
  });
};

export const studentRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as {
      organizationSlug?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      gender?: string;
      email?: string;
      phone?: string;
      phoneCode?: string;
      institutionName?: string;
      grade?: string;
      division?: string;
      country?: string;
      state?: string;
      city?: string;
      role?: "STUDENT" | "PARENT";
      captchaToken?: string;
      captchaAnswer?: string;
    };

    if (!(await validateCaptchaPayload(body.captchaToken, body.captchaAnswer))) {
      res.status(400).json({ message: "Invalid captcha" });
      return;
    }

    const requestedRole = typeof body.role === "string" ? body.role.toUpperCase().trim() : "STUDENT";
    if (requestedRole !== "STUDENT" && requestedRole !== "PARENT") {
      res.status(400).json({ message: "Role must be either STUDENT or PARENT" });
      return;
    }

    const selectedRole = requestedRole as "STUDENT" | "PARENT";

    const orgSlug = body.organizationSlug?.toLowerCase().trim();
    if (!orgSlug) {
      res.status(400).json({ message: "Organization identifier is required" });
      return;
    }

    if (!body.firstName?.trim() || !body.lastName?.trim()) {
      res.status(400).json({ message: "First name and last name are required" });
      return;
    }

    if (!body.email?.trim()) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    if (!isValidEmail(body.email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    if (!body.phone?.trim()) {
      res.status(400).json({ message: "Phone number is required" });
      return;
    }

    if (!isValidPhoneNumber(body.phone)) {
      res.status(400).json({ message: "Invalid phone number" });
      return;
    }

    const normalizedEmail = body.email.toLowerCase().trim();

    const organization = await Organization.findOne({ slug: orgSlug, isActive: true, type: "WHITELABEL" });
    if (!organization) {
      res.status(404).json({ message: "Organization portal not found" });
      return;
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({ message: "Email already registered. Please log in via the portal." });
      return;
    }

    const otp = generateOtp();

    await StudentRegistrationTemp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          organization: organization._id,
          organizationSlug: orgSlug,
          firstName: body.firstName.trim(),
          middleName: body.middleName?.trim() || undefined,
          lastName: body.lastName.trim(),
          gender: body.gender?.trim() || undefined,
          email: normalizedEmail,
          phone: body.phone.trim(),
          phoneCode: body.phoneCode?.trim() || "+91",
          grade: body.grade?.trim() || undefined,
          division: body.division?.trim() || undefined,
          country: body.country?.trim() || undefined,
          state: body.state?.trim() || undefined,
          city: body.city?.trim() || undefined,
          role: selectedRole,
          institutionName: body.institutionName?.trim() || organization.branding.companyName,
          otpHash: hashOtp(otp),
          otpExpiresAt: getOtpExpiry(5),
          otpAttempts: 0,
        },
      },
      { upsert: true }
    );

    await sendOtpEmail({
      email: normalizedEmail,
      firstName: body.firstName.trim(),
      otp,
      purpose: "registration",
    });

    res.status(201).json({
      message: "OTP sent to your email. Please verify to complete registration.",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Student register error:", error);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

export const verifyStudentRegisterOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body as { email?: string; otp?: string };

    if (!email?.trim() || !otp?.trim()) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const pending = await StudentRegistrationTemp.findOne({ email: normalizedEmail });

    if (!pending) {
      res.status(404).json({ message: "Registration not found. Please register again." });
      return;
    }

    if (!pending.otpHash || isOtpExpired(pending.otpExpiresAt)) {
      await StudentRegistrationTemp.deleteOne({ _id: pending._id });
      res.status(400).json({ message: "OTP expired. Please register again." });
      return;
    }

    if (!compareOtp(otp.trim(), pending.otpHash)) {
      pending.otpAttempts += 1;

      if (pending.otpAttempts >= 5) {
        await StudentRegistrationTemp.deleteOne({ _id: pending._id });
        res.status(429).json({ message: "Too many invalid attempts. Please register again." });
        return;
      }

      await pending.save();
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      await StudentRegistrationTemp.deleteOne({ _id: pending._id });
      res.status(409).json({ message: "Email already registered. Please log in via the portal." });
      return;
    }

    const user = await User.create({
      firstName: pending.firstName,
      middleName: pending.middleName,
      lastName: pending.lastName,
      email: pending.email,
      gender: pending.gender,
      phone: pending.phone,
      phoneCode: pending.phoneCode,
      grade: pending.grade,
      division: pending.division,
      country: pending.country,
      state: pending.state,
      city: pending.city,
      institutionName: pending.institutionName,
      role: pending.role || "STUDENT",
      organization: pending.organization,
      isVerified: true,
      isActive: true,
      otpHash: undefined,
      otpExpiresAt: undefined,
      otpPurpose: null,
      otpAttempts: 0,
    });

    await StudentRegistrationTemp.deleteOne({ _id: pending._id });

    await user.populate("organization");
    const org = user.organization as unknown as { slug: string } | undefined;

    issueAuthSession(res, user, {
      message: "Registration successful! Redirecting to your dashboard.",
      organizationSlug: org?.slug,
    });
  } catch (error) {
    console.error("Verify student register OTP error:", error);
    res.status(500).json({ message: "Verification failed. Please try again." });
  }
};
