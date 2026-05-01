import { Router } from "express";

import {
  getDashboard,
  getPlatformOverview,
  listAssessments,
} from "../controllers/platformController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/overview", getPlatformOverview);
router.get("/assessments", listAssessments);
router.get("/dashboard", requireAuth, getDashboard);

export default router;
