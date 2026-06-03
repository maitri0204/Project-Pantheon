import { Router } from "express";

import {
  getStudentAttempt,
  getStudentAttemptReportForAdmin,
  getStudentDetailsForAdmin,
  getOrganizationCouponSummary,
  getStudentDashboard,
  getDashboard,
  getAssessmentAdminDashboard,
  getAcademicCareerAdminOverview,
  getAdversityAdminOverview,
  getStudentAssessmentPricing,
  listStudentAssessmentAttempts,
  listStudentInvoices,
  listOrganizationInvoices,
  getStudentAttemptReport,
  listStudentResults,
  getPlatformOverview,
  getWhitelabelPortal,
  getWhitelabelPortalByHost,
  listStudents,
  listParents,
  listAssessments,
  listStudentAssessments,
  createStudentAssessmentPaymentOrder,
  createReviewerPaymentOrder,
  saveStudentAttemptAnswers,
  startStudentAssessment,
  submitStudentAttempt,
  logAntiCheatEvent,
  verifyReviewerPayment,
  verifyStudentAssessmentPayment,
  emailStudentAttemptReport,
  getOrganizationProfile,
  updateOrganizationProfile,
  updateOrganizationLogo,
  getParentDetailsForAdmin,
} from "../controllers/platformController";
import { optionalAuth, requireAuth, requireRoles } from "../middleware/auth";

const router = Router();

router.get("/overview", getPlatformOverview);
router.get("/assessments", listAssessments);
router.get("/whitelabel/:slug", optionalAuth, getWhitelabelPortal);
router.get("/whitelabel-by-host", optionalAuth, getWhitelabelPortalByHost);
router.get("/dashboard", requireAuth, getDashboard);
router.get(
  "/assessments/:code/admin-dashboard",
  requireAuth,
  requireRoles("SUPERADMIN", "ORG_ADMIN"),
  getAssessmentAdminDashboard,
);
router.get(
  "/assessments/ACADEMIC_CAREER/admin-overview",
  requireAuth,
  requireRoles("SUPERADMIN", "ORG_ADMIN"),
  getAcademicCareerAdminOverview,
);
router.get(
  "/assessments/ADVERSITY_TEST/admin-overview",
  requireAuth,
  requireRoles("SUPERADMIN", "ORG_ADMIN"),
  getAdversityAdminOverview,
);
router.get("/students", requireAuth, requireRoles("SUPERADMIN", "ORG_ADMIN"), listStudents);
router.get("/students/:studentId", requireAuth, requireRoles("SUPERADMIN", "ORG_ADMIN"), getStudentDetailsForAdmin);
router.get("/students/:studentId/attempts/:attemptId/report", requireAuth, requireRoles("SUPERADMIN", "ORG_ADMIN"), getStudentAttemptReportForAdmin);
router.get("/parents", requireAuth, requireRoles("SUPERADMIN", "ORG_ADMIN"), listParents);
router.get("/parents/:parentId", requireAuth, requireRoles("SUPERADMIN", "ORG_ADMIN"), getParentDetailsForAdmin);
router.get("/student/dashboard", requireAuth, requireRoles("STUDENT", "PARENT"), getStudentDashboard);
router.get("/student/results", requireAuth, requireRoles("STUDENT", "PARENT"), listStudentResults);
router.get("/student/invoices", requireAuth, requireRoles("STUDENT", "PARENT"), listStudentInvoices);
router.get("/student/assessments", requireAuth, requireRoles("STUDENT", "PARENT"), listStudentAssessments);
router.get("/student/assessments/:code/attempts", requireAuth, requireRoles("STUDENT", "PARENT"), listStudentAssessmentAttempts);
router.get("/student/assessments/:code/pricing", requireAuth, requireRoles("STUDENT", "PARENT"), getStudentAssessmentPricing);
router.post("/student/assessments/:code/payment/order", requireAuth, requireRoles("STUDENT", "PARENT"), createStudentAssessmentPaymentOrder);
router.post("/student/assessments/:code/payment/verify", requireAuth, requireRoles("STUDENT", "PARENT"), verifyStudentAssessmentPayment);
router.post("/reviewer/payment/order", requireAuth, requireRoles("REVIEWER"), createReviewerPaymentOrder);
router.post("/reviewer/payment/verify", requireAuth, requireRoles("REVIEWER"), verifyReviewerPayment);
router.get("/organization/invoices", requireAuth, requireRoles("ORG_ADMIN"), listOrganizationInvoices);
router.get("/organization/coupons/summary", requireAuth, requireRoles("ORG_ADMIN"), getOrganizationCouponSummary);
router.get("/organization/profile", requireAuth, requireRoles("ORG_ADMIN"), getOrganizationProfile);
router.patch("/organization/profile", requireAuth, requireRoles("ORG_ADMIN"), updateOrganizationProfile);
router.patch("/organization/logo", requireAuth, requireRoles("ORG_ADMIN"), updateOrganizationLogo);
router.post("/student/assessments/:code/start", requireAuth, requireRoles("STUDENT", "PARENT"), startStudentAssessment);
router.get("/student/attempts/:attemptId", requireAuth, requireRoles("STUDENT", "PARENT"), getStudentAttempt);
router.get("/student/attempts/:attemptId/report", requireAuth, requireRoles("STUDENT", "PARENT"), getStudentAttemptReport);
router.patch("/student/attempts/:attemptId/answers", requireAuth, requireRoles("STUDENT", "PARENT"), saveStudentAttemptAnswers);
router.post("/student/attempts/:attemptId/submit", requireAuth, requireRoles("STUDENT", "PARENT"), submitStudentAttempt);
router.post("/student/attempts/:attemptId/anti-cheat-event", requireAuth, requireRoles("STUDENT", "PARENT"), logAntiCheatEvent);
router.post("/student/attempts/:attemptId/email-report", requireAuth, requireRoles("STUDENT", "PARENT"), emailStudentAttemptReport);

export default router;
