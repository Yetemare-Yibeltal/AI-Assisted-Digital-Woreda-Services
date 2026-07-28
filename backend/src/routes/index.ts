import { Router } from "express";
import serviceRoutes from "./v1/services";
import applicationRoutes from "./v1/applications";
import adminRoutes from "./v1/admin";
import authRoutes from "./v1/auth";
import publicRoutes from "./v1/public";
import dashboardRoutes from "./v1/dashboard";
import pdfRoutes from "./v1/pdf";

const router = Router();

// Health check
router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Dangila Digital Woreda Services API v1",
    version: "1.0.0",
    documentation: "/api/v1/docs",
    timestamp: new Date().toISOString(),
  });
});

// Public routes (no authentication required)
router.use("/public", publicRoutes);

// Authentication routes
router.use("/auth", authRoutes);

// Protected routes (JWT required)
router.use("/services", serviceRoutes);
router.use("/applications", applicationRoutes);
router.use("/admin", adminRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/pdf", pdfRoutes);

export default router;
