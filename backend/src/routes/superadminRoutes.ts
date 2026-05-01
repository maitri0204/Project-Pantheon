import { Router } from "express";

import {
  createCoupon,
  createOrganization,
  getSuperadminDashboard,
  listCoupons,
  updateAssessmentPricing,
} from "../controllers/superadminController";
import { requireAuth, requireRoles } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireRoles("SUPERADMIN"));
router.get("/dashboard", getSuperadminDashboard);
router.post("/organizations", createOrganization);
router.get("/coupons", listCoupons);
router.post("/coupons", createCoupon);
router.patch("/assessments/:code/pricing", updateAssessmentPricing);

export default router;
