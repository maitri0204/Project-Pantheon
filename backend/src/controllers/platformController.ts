import { Response } from "express";

import Assessment from "../models/Assessment";
import Coupon from "../models/Coupon";
import Invoice from "../models/Invoice";
import Organization from "../models/Organization";
import User from "../models/User";
import { DEFAULT_SUPERADMIN_EMAIL } from "../constants/platform";
import { AuthRequest } from "../types/auth";

export const getPlatformOverview = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [assessmentCount, organizationCount] = await Promise.all([
    Assessment.countDocuments({ active: true }),
    Organization.countDocuments({ isActive: true }),
  ]);

  res.json({
    platform: {
      defaultSuperadminEmail: DEFAULT_SUPERADMIN_EMAIL,
      assessmentCount,
      organizationCount,
      capabilities: [
        "Unified assessment catalog",
        "Whitelabel organization support",
        "Superadmin pricing and coupon management",
        "OTP + captcha auth",
      ],
    },
  });
};

export const listAssessments = async (_req: AuthRequest, res: Response): Promise<void> => {
  const assessments = await Assessment.find({ active: true }).sort({ name: 1 });
  res.json({ assessments });
};

export const getWhitelabelPortal = async (req: AuthRequest, res: Response): Promise<void> => {
  const slug = req.params.slug?.toLowerCase().trim();
  if (!slug) {
    res.status(400).json({ message: "Organization slug is required" });
    return;
  }

  const organization = await Organization.findOne({ slug, isActive: true, type: "WHITELABEL" });
  if (!organization) {
    res.status(404).json({ message: "Whitelabel organization not found" });
    return;
  }

  const userOrgId = req.user?.organization && typeof req.user.organization === "object"
    ? String((req.user.organization as { _id: { toString(): string } })._id)
    : null;

  const canAccessAssessments =
    Boolean(req.user) &&
    (req.user?.role === "ORG_ADMIN" || req.user?.role === "STUDENT") &&
    userOrgId === String(organization._id);

  const assessments = canAccessAssessments
    ? await Assessment.find({ active: true }).sort({ name: 1 })
    : [];

  res.json({
    organization: {
      id: organization._id,
      name: organization.name,
      slug: organization.slug,
      website: organization.website,
      branding: organization.branding,
    },
    canAccessAssessments,
    assessments,
    message: canAccessAssessments
      ? undefined
      : "Login required. Only users from this organization can view assessments.",
  });
};

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const [assessments, organizations, coupons, invoices, students] = await Promise.all([
    Assessment.find({ active: true }).sort({ name: 1 }),
    req.user.role === "SUPERADMIN"
      ? Organization.find().sort({ createdAt: -1 })
      : Organization.find({ _id: req.user.organization }).sort({ createdAt: -1 }),
    req.user.role === "SUPERADMIN"
      ? Coupon.find().sort({ createdAt: -1 }).limit(10)
      : Coupon.find({}).sort({ createdAt: -1 }).limit(10),
    req.user.role === "SUPERADMIN"
      ? Invoice.find().sort({ createdAt: -1 }).limit(10)
      : Invoice.find({ organization: req.user.organization }).sort({ createdAt: -1 }).limit(10),
    req.user.role === "SUPERADMIN"
      ? User.countDocuments({ role: "STUDENT" })
      : User.countDocuments({ role: "STUDENT", organization: req.user.organization }),
  ]);

  res.json({
    role: req.user.role,
    stats: {
      assessments: assessments.length,
      organizations: organizations.length,
      students,
      coupons: coupons.length,
      invoices: invoices.length,
    },
    assessments,
    organizations,
    coupons,
    invoices,
  });
};

export const listStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const scope = req.user.role === "SUPERADMIN" ? {} : { organization: req.user.organization };

  const students = await User.find({ role: "STUDENT", ...scope })
    .populate("organization", "name slug")
    .sort({ createdAt: -1 });

  const studentIds = students.map((student) => student._id);
  const invoiceCounts = await Invoice.aggregate<{ _id: string; count: number }>([
    { $match: { user: { $in: studentIds } } },
    { $group: { _id: "$user", count: { $sum: 1 } } },
  ]);

  const invoiceCountMap = new Map(invoiceCounts.map((row) => [String(row._id), row.count]));

  const studentsWithStats = students
    .map((student) => ({
      ...student.toObject(),
      testsTaken: invoiceCountMap.get(String(student._id)) || 0,
    }));

  const studentsPayload =
    req.user.role === "ORG_ADMIN"
      ? studentsWithStats.filter((student) => student.testsTaken > 0)
      : studentsWithStats;

  res.json({
    students: studentsPayload,
  });
};
