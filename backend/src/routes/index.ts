import { Router } from "express";

import authRoutes from "./authRoutes";
import platformRoutes from "./platformRoutes";
import superadminRoutes from "./superadminRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/platform", platformRoutes);
router.use("/superadmin", superadminRoutes);

export default router;
