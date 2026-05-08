import { Router } from "express";

import {
  getStudentAttempt,
  getStudentAttemptReportForAdmin,
  getStudentDetailsForAdmin,
  getOrganizationCouponSummary,
  getStudentDashboard,
  getDashboard,
  getStudentAssessmentPricing,
  listStudentInvoices,
  listOrganizationInvoices,
  getStudentAttemptReport,
  listStudentResults,
  getPlatformOverview,
  getWhitelabelPortal,
  getWhitelabelPortalByHost,
  listStudents,
  listAssessments,
  listStudentAssessments,
  createStudentAssessmentPaymentOrder,
  saveStudentAttemptAnswers,
  startStudentAssessment,
  submitStudentAttempt,
  verifyStudentAssessmentPayment,
  emailStudentAttemptReport,
} from "../controllers/platformController";
import { optionalAuth, requireAuth, requireRoles } from "../middleware/auth";

const router = Router();

router.get("/overview", getPlatformOverview);
router.get("/assessments", listAssessments);
router.get("/whitelabel/:slug", optionalAuth, getWhitelabelPortal);
router.get("/whitelabel-by-host", optionalAuth, getWhitelabelPortalByHost);
router.get("/dashboard", requireAuth, getDashboard);
router.get("/students", requireAuth, requireRoles("SUPERADMIN", "ORG_ADMIN"), listStudents);
router.get("/students/:studentId", requireAuth, requireRoles("SUPERADMIN", "ORG_ADMIN"), getStudentDetailsForAdmin);
router.get("/students/:studentId/attempts/:attemptId/report", requireAuth, requireRoles("SUPERADMIN", "ORG_ADMIN"), getStudentAttemptReportForAdmin);
router.get("/student/dashboard", requireAuth, requireRoles("STUDENT"), getStudentDashboard);
router.get("/student/results", requireAuth, requireRoles("STUDENT"), listStudentResults);
router.get("/student/invoices", requireAuth, requireRoles("STUDENT"), listStudentInvoices);
router.get("/student/assessments", requireAuth, requireRoles("STUDENT"), listStudentAssessments);
router.get("/student/assessments/:code/pricing", requireAuth, requireRoles("STUDENT"), getStudentAssessmentPricing);
router.post("/student/assessments/:code/payment/order", requireAuth, requireRoles("STUDENT"), createStudentAssessmentPaymentOrder);
router.post("/student/assessments/:code/payment/verify", requireAuth, requireRoles("STUDENT"), verifyStudentAssessmentPayment);
router.get("/organization/invoices", requireAuth, requireRoles("ORG_ADMIN"), listOrganizationInvoices);
router.get("/organization/coupons/summary", requireAuth, requireRoles("ORG_ADMIN"), getOrganizationCouponSummary);
router.post("/student/assessments/:code/start", requireAuth, requireRoles("STUDENT"), startStudentAssessment);
router.get("/student/attempts/:attemptId", requireAuth, requireRoles("STUDENT"), getStudentAttempt);
router.get("/student/attempts/:attemptId/report", requireAuth, requireRoles("STUDENT"), getStudentAttemptReport);
router.patch("/student/attempts/:attemptId/answers", requireAuth, requireRoles("STUDENT"), saveStudentAttemptAnswers);
router.post("/student/attempts/:attemptId/submit", requireAuth, requireRoles("STUDENT"), submitStudentAttempt);
router.post("/student/attempts/:attemptId/email-report", requireAuth, requireRoles("STUDENT"), emailStudentAttemptReport);

export default router;
