import { Router } from "express";
import rateLimit from "express-rate-limit";

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
  listPendingOrganizations,
  approvePendingOrganization,
  rejectPendingOrganization,
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

const superadminActionLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many admin requests. Please try again later." },
});

router.use(requireAuth, requireRoles("SUPERADMIN"), superadminActionLimit);
router.get("/dashboard", getSuperadminDashboard);
router.get("/organizations/pending", listPendingOrganizations);
router.post("/organizations/:organizationId/approve", approvePendingOrganization);
router.post("/organizations/:organizationId/reject", rejectPendingOrganization);
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
