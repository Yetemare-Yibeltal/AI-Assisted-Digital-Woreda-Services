import { Router } from "express";
import {
  getAllServices,
  getServiceById,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  getPopularServices,
  getServicesByCategory,
  searchServices,
  getServiceCategories,
  bulkUpdateServices,
} from "../../controllers/serviceController";
import { authenticate } from "../../middleware/auth";
import { adminOnly, superAdminOnly, officerAndAbove } from "../../middleware/roleCheck";
import { validateBody, validateQuery, validateParams } from "../../middleware/validate";
import {
  createServiceSchema,
  updateServiceSchema,
  serviceQuerySchema,
  serviceIdParamSchema,
} from "../../validators/serviceValidator";

const router = Router();

// Public routes
router.get("/popular", getPopularServices);
router.get("/categories", getServiceCategories);
router.get("/search", searchServices);
router.get("/category/:category", getServicesByCategory);
router.get("/slug/:slug", getServiceBySlug);

// Protected routes
router.use(authenticate);

router.get("/", validateQuery(serviceQuerySchema), getAllServices);
router.get("/:id", validateParams(serviceIdParamSchema), getServiceById);

router.post("/", officerAndAbove, validateBody(createServiceSchema), createService);
router.put(
  "/:id",
  officerAndAbove,
  validateParams(serviceIdParamSchema),
  validateBody(updateServiceSchema),
  updateService
);
router.patch(
  "/:id/toggle",
  officerAndAbove,
  validateParams(serviceIdParamSchema),
  toggleServiceStatus
);
router.delete("/:id", adminOnly, validateParams(serviceIdParamSchema), deleteService);

router.post("/bulk-update", adminOnly, bulkUpdateServices);

export default router;
