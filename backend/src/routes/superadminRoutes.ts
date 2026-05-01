import { Router } from "express";

import {
  createCoupon,
  createOrganization,
  createQuestion,
  deleteCoupon,
  deleteQuestion,
  getLedger,
  getSuperadminDashboard,
  listCoupons,
  listQuestions,
  updateAssessmentPricing,
  updateCoupon,
  updateQuestion,
} from "../controllers/superadminController";
import { requireAuth, requireRoles } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireRoles("SUPERADMIN"));
router.get("/dashboard", getSuperadminDashboard);
router.post("/organizations", createOrganization);
router.get("/coupons", listCoupons);
router.post("/coupons", createCoupon);
router.patch("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);
router.patch("/assessments/:code/pricing", updateAssessmentPricing);

router.get("/ledger", getLedger);

// Question bank routes
router.get("/assessments/:code/questions", listQuestions);
router.post("/assessments/:code/questions", createQuestion);
router.patch("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

export default router;
