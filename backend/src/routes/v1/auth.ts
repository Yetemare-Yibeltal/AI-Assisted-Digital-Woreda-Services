import { Router } from "express";
import {
  login,
  refreshTokens,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} from "../../controllers/authController";
import { authenticate } from "../../middleware/auth";
import { authLimiter } from "../../middleware/rateLimiter";
import { validateBody } from "../../middleware/validate";
import {
  loginSchema,
  tokenRefreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../validators/authValidator";

const router = Router();

router.post("/login", authLimiter, validateBody(loginSchema), login);
router.post("/refresh-token", validateBody(tokenRefreshSchema), refreshTokens);
router.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validateBody(resetPasswordSchema), resetPassword);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getCurrentUser);

export default router;
