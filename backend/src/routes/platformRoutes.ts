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
import { completeOrganizationRegistration } from "../controllers/authController";
import { optionalAuth, requireAuth, requireRoles } from "../middleware/auth";

const router = Router();

router.get("/overview", getPlatformOverview);
router.get("/assessments", listAssessments);
router.get("/whitelabel/:slug", optionalAuth, getWhitelabelPortal);
router.post("/whitelabel/register", completeOrganizationRegistration);
router.get("/whitelabel-by-host", optionalAuth, getWhitelabelPortalByHost);
router.get("/dashboard", requireAuth, getDashboard);
router.get("/students", requireAuth, requireRoles("SUPERADMIN", "ORG_ADMIN"), listStudents);
router.get("/students/:studentId", requireAuth, requireRoles("SUPERADMIN", "ORG_ADMIN"), getStudentDetailsForAdmin);
router.get("/students/:studentId/attempts/:attemptId/report", requireAuth, requireRoles("SUPERADMIN", "ORG_ADMIN"), getStudentAttemptReportForAdmin);
router.get("/student/dashboard", requireAuth, requireRoles("STUDENT", "PARENT"), getStudentDashboard);
router.get("/student/results", requireAuth, requireRoles("STUDENT", "PARENT"), listStudentResults);
router.get("/student/invoices", requireAuth, requireRoles("STUDENT", "PARENT"), listStudentInvoices);
router.get("/student/assessments", requireAuth, requireRoles("STUDENT", "PARENT"), listStudentAssessments);
router.get("/student/assessments/:code/pricing", requireAuth, requireRoles("STUDENT", "PARENT"), getStudentAssessmentPricing);
router.post("/student/assessments/:code/payment/order", requireAuth, requireRoles("STUDENT", "PARENT"), createStudentAssessmentPaymentOrder);
router.post("/student/assessments/:code/payment/verify", requireAuth, requireRoles("STUDENT", "PARENT"), verifyStudentAssessmentPayment);
router.get("/organization/invoices", requireAuth, requireRoles("ORG_ADMIN"), listOrganizationInvoices);
router.get("/organization/coupons/summary", requireAuth, requireRoles("ORG_ADMIN"), getOrganizationCouponSummary);
router.post("/student/assessments/:code/start", requireAuth, requireRoles("STUDENT", "PARENT"), startStudentAssessment);
router.get("/student/attempts/:attemptId", requireAuth, requireRoles("STUDENT", "PARENT"), getStudentAttempt);
router.get("/student/attempts/:attemptId/report", requireAuth, requireRoles("STUDENT", "PARENT"), getStudentAttemptReport);
router.patch("/student/attempts/:attemptId/answers", requireAuth, requireRoles("STUDENT", "PARENT"), saveStudentAttemptAnswers);
router.post("/student/attempts/:attemptId/submit", requireAuth, requireRoles("STUDENT", "PARENT"), submitStudentAttempt);
router.post("/student/attempts/:attemptId/email-report", requireAuth, requireRoles("STUDENT", "PARENT"), emailStudentAttemptReport);

export default router;
