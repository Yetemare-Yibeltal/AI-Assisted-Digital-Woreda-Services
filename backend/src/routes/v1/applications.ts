
import { Router } from "express";
import {
  createApplication,
  getAllApplications,
  getApplicationById,
  getApplicationByTrackingNumber,
  updateApplicationStatus,
  assignApplication,
  updateApplicationPriority,
  addDocument,
  verifyDocument,
  getApplicationStats,
  deleteApplication,
} from "../../controllers/applicationController";
import { authenticate } from "../../middleware/auth";
import { officerAndAbove, adminOnly } from "../../middleware/roleCheck";
import { validateBody, validateQuery, validateParams } from "../../middleware/validate";
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
  applicationQuerySchema,
  applicationIdParamSchema,
  trackingNumberParamSchema,
} from "../../validators/applicationValidator";
import { applicationSubmitLimiter } from "../../middleware/rateLimiter";

const router = Router();
router.use(authenticate);
router.get("/", validateQuery(applicationQuerySchema), getAllApplications);
router.get("/stats", getApplicationStats);
router.get("/tracking/:trackingNumber", validateParams(trackingNumberParamSchema), getApplicationByTrackingNumber);
router.get("/:id", validateParams(applicationIdParamSchema), getApplicationById);
router.post("/", officerAndAbove, applicationSubmitLimiter, validateBody(createApplicationSchema), createApplication);
router.patch("/:id/status", officerAndAbove, validateParams(applicationIdParamSchema), validateBody(updateApplicationStatusSchema), updateApplicationStatus);
router.patch("/:id/assign", adminOnly, validateParams(applicationIdParamSchema), assignApplication);
router.patch("/:id/priority", officerAndAbove, validateParams(applicationIdParamSchema), updateApplicationPriority);
router.post("/:id/documents", officerAndAbove, validateParams(applicationIdParamSchema), addDocument);
router.patch("/:id/documents/:documentId/verify", officerAndAbove, verifyDocument);
router.delete("/:id", adminOnly, validateParams(applicationIdParamSchema), deleteApplication);
export default router; 