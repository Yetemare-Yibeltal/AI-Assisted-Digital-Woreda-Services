import { Router } from "express";
import {
  getRecommendations,
  getRecommendationsByCategory,
  compareServices,
  getPopularRecommendations,
} from "../../../controllers/ai/recommendationController";
import { optionalAuth } from "../../../middleware/auth";
import { aiRateLimiter } from "../../../middleware/ai/aiRateLimiter";
import { validateBody } from "../../../middleware/validate";
import Joi from "joi";

const router = Router();

const recommendationSchema = Joi.object({
  query: Joi.string().min(1).max(1000).required().messages({
    "string.min": "Query cannot be empty",
    "string.max": "Query cannot exceed 1000 characters",
    "any.required": "Query is required",
  }),
  language: Joi.string().valid("en", "am").optional(),
  maxResults: Joi.number().integer().min(1).max(10).default(5),
});

const compareSchema = Joi.object({
  serviceSlugs: Joi.array().items(Joi.string().min(1).max(100)).min(2).max(5).required().messages({
    "array.min": "At least 2 services are required for comparison",
    "array.max": "Maximum 5 services can be compared",
    "any.required": "Service slugs are required",
  }),
  language: Joi.string().valid("en", "am").optional(),
});

// Main recommendation endpoint
router.post(
  "/",
  optionalAuth,
  aiRateLimiter,
  validateBody(recommendationSchema),
  getRecommendations
);

// Service comparison
router.post("/compare", optionalAuth, aiRateLimiter, validateBody(compareSchema), compareServices);

// Popular recommendations
router.get("/popular", getPopularRecommendations);

// Category-based recommendations
router.get("/category/:category", optionalAuth, aiRateLimiter, getRecommendationsByCategory);

export default router;
