import { Router } from "express";

import {
  getDashboard,
  getPlatformOverview,
  getWhitelabelPortal,
  listStudents,
  listAssessments,
} from "../controllers/platformController";
import { optionalAuth, requireAuth, requireRoles } from "../middleware/auth";

const router = Router();

router.get("/overview", getPlatformOverview);
router.get("/assessments", listAssessments);
router.get("/whitelabel/:slug", optionalAuth, getWhitelabelPortal);
router.get("/dashboard", requireAuth, getDashboard);
router.get("/students", requireAuth, requireRoles("SUPERADMIN", "ORG_ADMIN"), listStudents);

export default router;
