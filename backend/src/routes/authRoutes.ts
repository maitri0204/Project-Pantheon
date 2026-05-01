import { Router } from "express";

import {
  getCaptchaChallenge,
  getMe,
  login,
  signup,
  verifyLoginOtp,
  verifySignupOtp,
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/captcha", getCaptchaChallenge);
router.post("/signup", signup);
router.post("/signup/verify-otp", verifySignupOtp);
router.post("/login", login);
router.post("/login/verify-otp", verifyLoginOtp);
router.get("/me", requireAuth, getMe);

export default router;
