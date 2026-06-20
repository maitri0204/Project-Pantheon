import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  completeOrganizationRegistration,
  getCaptchaChallenge,
  getMe,
  login,
  requestRegistrationOtp,
  signup,
  studentRegister,
  verifyRegistrationOtp,
  verifyLoginOtp,
  verifySignupOtp,
  verifyStudentRegisterOtp,
  logout,
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

const authAttemptLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." },
});

const otpRequestLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests. Please try again later." },
});

const captchaLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many captcha requests. Please try again later." },
});

router.get("/captcha", captchaLimit, getCaptchaChallenge);
router.post("/register/request-otp", otpRequestLimit, requestRegistrationOtp);
router.post("/register/verify-otp", authAttemptLimit, verifyRegistrationOtp);
router.post("/register/complete", authAttemptLimit, completeOrganizationRegistration);
router.post("/signup", otpRequestLimit, signup);
router.post("/signup/verify-otp", authAttemptLimit, verifySignupOtp);
router.post("/login", authAttemptLimit, login);
router.post("/login/verify-otp", authAttemptLimit, verifyLoginOtp);
router.post("/logout", logout);
router.post("/student-register", otpRequestLimit, studentRegister);
router.post("/student-register/verify-otp", authAttemptLimit, verifyStudentRegisterOtp);
router.get("/me", requireAuth, getMe);

export default router;
