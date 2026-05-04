import { Router } from "express";

import {
  getStudentAttempt,
  getStudentDashboard,
  getDashboard,
  getStudentAttemptReport,
  listStudentResults,
  getPlatformOverview,
  getWhitelabelPortal,
  listStudents,
  listAssessments,
  listStudentAssessments,
  saveStudentAttemptAnswers,
  startStudentAssessment,
  submitStudentAttempt,
} from "../controllers/platformController";
import { optionalAuth, requireAuth, requireRoles } from "../middleware/auth";

const router = Router();

router.get("/overview", getPlatformOverview);
router.get("/assessments", listAssessments);
router.get("/whitelabel/:slug", optionalAuth, getWhitelabelPortal);
router.get("/dashboard", requireAuth, getDashboard);
router.get("/students", requireAuth, requireRoles("SUPERADMIN", "ORG_ADMIN"), listStudents);
router.get("/student/dashboard", requireAuth, requireRoles("STUDENT"), getStudentDashboard);
router.get("/student/results", requireAuth, requireRoles("STUDENT"), listStudentResults);
router.get("/student/assessments", requireAuth, requireRoles("STUDENT"), listStudentAssessments);
router.post("/student/assessments/:code/start", requireAuth, requireRoles("STUDENT"), startStudentAssessment);
router.get("/student/attempts/:attemptId", requireAuth, requireRoles("STUDENT"), getStudentAttempt);
router.get("/student/attempts/:attemptId/report", requireAuth, requireRoles("STUDENT"), getStudentAttemptReport);
router.patch("/student/attempts/:attemptId/answers", requireAuth, requireRoles("STUDENT"), saveStudentAttemptAnswers);
router.post("/student/attempts/:attemptId/submit", requireAuth, requireRoles("STUDENT"), submitStudentAttempt);

export default router;
