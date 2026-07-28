import { Router } from "express";

const router = Router();

// Routes will be added here in Phase 10
// Example: router.use("/services", serviceRoutes);

// Temporary test route
router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Dangila Digital Woreda Services API v1",
    version: "1.0.0",
  });
});

export default router;
