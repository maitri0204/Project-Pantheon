import { Request, Response } from "express";

import Assessment from "../models/Assessment";
import Coupon from "../models/Coupon";
import Organization from "../models/Organization";
import User from "../models/User";
import { AuthRequest } from "../types/auth";

export const getSuperadminDashboard = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [assessments, organizations, users, coupons] = await Promise.all([
    Assessment.find().sort({ name: 1 }),
    Organization.find().sort({ createdAt: -1 }),
    User.find().sort({ createdAt: -1 }).limit(25).populate("organization"),
    Coupon.find().sort({ createdAt: -1 }),
  ]);

  res.json({ assessments, organizations, users, coupons });
};

export const createOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, contactEmail } = req.body as {
      name?: string;
      slug?: string;
      contactEmail?: string;
    };

    if (!name?.trim() || !slug?.trim()) {
      res.status(400).json({ message: "Name and slug are required" });
      return;
    }

    const organization = await Organization.create({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      contactEmail: contactEmail?.trim().toLowerCase(),
      type: "WHITELABEL",
      isActive: true,
      branding: {
        companyName: name.trim(),
        primaryColor: "#2563eb",
        accentColor: "#06b6d4",
      },
      settings: {
        allowSelfSignup: true,
        assessmentCatalogVisible: true,
      },
    });

    res.status(201).json({ organization });
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).json({ message: "Organization slug already exists" });
      return;
    }

    console.error("Create organization error:", error);
    res.status(500).json({ message: "Failed to create organization" });
  }
};

export const updateAssessmentPricing = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = String(req.params.code || "");
    const { basePrice } = req.body as { basePrice?: number };

    if (typeof basePrice !== "number" || basePrice < 0) {
      res.status(400).json({ message: "basePrice must be a non-negative number" });
      return;
    }

    const assessment = await Assessment.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $set: { basePrice } },
      { new: true }
    );

    if (!assessment) {
      res.status(404).json({ message: "Assessment not found" });
      return;
    }

    res.json({ assessment });
  } catch (error) {
    console.error("Update assessment pricing error:", error);
    res.status(500).json({ message: "Failed to update assessment pricing" });
  }
};

export const listCoupons = async (_req: AuthRequest, res: Response): Promise<void> => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ coupons });
};

export const createCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { code, discountType, value, applicableAssessmentCodes, expiresAt } = req.body as {
      code?: string;
      discountType?: "FLAT" | "PERCENT";
      value?: number;
      applicableAssessmentCodes?: string[];
      expiresAt?: string;
    };

    if (!code?.trim() || !discountType || typeof value !== "number") {
      res.status(400).json({ message: "code, discountType, and value are required" });
      return;
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      value,
      applicableAssessmentCodes: applicableAssessmentCodes || [],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isActive: true,
      createdBy: req.user._id,
    });

    res.status(201).json({ coupon });
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).json({ message: "Coupon code already exists" });
      return;
    }

    console.error("Create coupon error:", error);
    res.status(500).json({ message: "Failed to create coupon" });
  }
};
