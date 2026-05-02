import { Router } from "express";

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
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/captcha", getCaptchaChallenge);
router.post("/register/request-otp", requestRegistrationOtp);
router.post("/register/verify-otp", verifyRegistrationOtp);
router.post("/register/complete", completeOrganizationRegistration);
router.post("/signup", signup);
router.post("/signup/verify-otp", verifySignupOtp);
router.post("/login", login);
router.post("/login/verify-otp", verifyLoginOtp);
router.post("/student-register", studentRegister);
router.post("/student-register/verify-otp", verifyStudentRegisterOtp);
router.get("/me", requireAuth, getMe);

export default router;
