import { Router } from "express";

import {
  createCoupon,
  createOrganization,
  createOrganizationCouponConfig,
  createQuestion,
  deleteCoupon,
  deleteQuestion,
  getLedger,
  getOrganizationCouponDetails,
  getSuperadminDashboard,
  listCoupons,
  listQuestions,
  updateAssessmentPricing,
  updateAssessmentReleaseDate,
  updateCoupon,
  updateOrganizationCouponConfig,
  updateQuestion,
} from "../controllers/superadminController";
import { requireAuth, requireRoles } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireRoles("SUPERADMIN"));
router.get("/dashboard", getSuperadminDashboard);
router.post("/organizations", createOrganization);
router.get("/organizations/:organizationId/coupons", getOrganizationCouponDetails);
router.post("/organizations/:organizationId/coupons", createOrganizationCouponConfig);
router.patch("/organizations/:organizationId/coupons/:configId", updateOrganizationCouponConfig);
router.get("/coupons", listCoupons);
router.post("/coupons", createCoupon);
router.patch("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);
router.patch("/assessments/:code/pricing", updateAssessmentPricing);
router.patch("/assessments/:code/release-date", updateAssessmentReleaseDate);

router.get("/ledger", getLedger);

// Question bank routes
router.get("/assessments/:code/questions", listQuestions);
router.post("/assessments/:code/questions", createQuestion);
router.patch("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

export default router;
