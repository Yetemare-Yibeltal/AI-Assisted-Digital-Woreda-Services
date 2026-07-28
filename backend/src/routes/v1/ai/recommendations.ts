import { Router } from "express";
import {
  getRecommendations,
  getRecommendationsByCategory,
} from "../../../controllers/ai/recommendationController";
import { aiRateLimiter } from "../../../middleware/ai/aiRateLimiter";

const router = Router();

router.use(aiRateLimiter);

router.post("/", getRecommendations);
router.get("/category/:category", getRecommendationsByCategory);

export default router;
