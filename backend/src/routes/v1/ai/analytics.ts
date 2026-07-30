import { Router } from "express";
import { getAIAnalytics } from "../../../controllers/ai/analyticsController";
import { authenticate } from "../../../middleware/auth";
import { aiRateLimiter } from "../../../middleware/ai/aiRateLimiter";

const router = Router();

router.get("/", authenticate, aiRateLimiter, getAIAnalytics);

export default router;
