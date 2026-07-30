import { Router } from "express";
import {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
  updatePermissions,
  changePassword,
  unlockAccount,
  getAdminsByDepartment,
} from "../../controllers/adminController";
import { authenticate } from "../../middleware/auth";
import { adminOnly, superAdminOnly } from "../../middleware/roleCheck";
import { validateBody, validateQuery, validateParams } from "../../middleware/validate";
import {
  createAdminSchema,
  updateAdminSchema,
  updatePasswordSchema,
  adminQuerySchema,
  adminIdParamSchema,
} from "../../validators/adminValidator";

const router = Router();
router.use(authenticate);

router.get("/", adminOnly, validateQuery(adminQuerySchema), getAllAdmins);
router.get("/department/:department", adminOnly, getAdminsByDepartment);
router.get("/:id", adminOnly, validateParams(adminIdParamSchema), getAdminById);
router.post("/", superAdminOnly, validateBody(createAdminSchema), createAdmin);
router.put(
  "/:id",
  adminOnly,
  validateParams(adminIdParamSchema),
  validateBody(updateAdminSchema),
  updateAdmin
);
router.patch(
  "/:id/change-password",
  validateParams(adminIdParamSchema),
  validateBody(updatePasswordSchema),
  changePassword
);
router.patch(
  "/:id/toggle-status",
  superAdminOnly,
  validateParams(adminIdParamSchema),
  toggleAdminStatus
);
router.patch(
  "/:id/permissions",
  superAdminOnly,
  validateParams(adminIdParamSchema),
  updatePermissions
);
router.patch("/:id/unlock", adminOnly, validateParams(adminIdParamSchema), unlockAccount);
router.delete("/:id", superAdminOnly, validateParams(adminIdParamSchema), deleteAdmin);

export default router;
