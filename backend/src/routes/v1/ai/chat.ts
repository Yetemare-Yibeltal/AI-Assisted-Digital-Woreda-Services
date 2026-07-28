import { Router } from "express";
import {
  sendMessage,
  getSessionHistory,
  clearSession,
  getQuickRecommendations,
  getSuggestedQuestions,
} from "../../../controllers/ai/chatController";
import { authenticate } from "../../../middleware/auth";
import { optionalAuth } from "../../../middleware/auth";
import { aiRateLimiter, strictAiRateLimiter } from "../../../middleware/ai/aiRateLimiter";
import { validateBody, validateParams } from "../../../middleware/validate";
import Joi from "joi";

const router = Router();

// Validation schemas
const sendMessageSchema = Joi.object({
  sessionId: Joi.string().max(100).optional(),
  message: Joi.string().min(1).max(2000).required().messages({
    "string.min": "Message cannot be empty",
    "string.max": "Message cannot exceed 2000 characters",
    "any.required": "Message is required",
  }),
  language: Joi.string().valid("en", "am").optional(),
});

const sessionIdParamSchema = Joi.object({
  sessionId: Joi.string().min(1).max(100).required().messages({
    "string.min": "Session ID cannot be empty",
    "string.max": "Session ID cannot exceed 100 characters",
    "any.required": "Session ID is required",
  }),
});

const recommendationQuerySchema = Joi.object({
  query: Joi.string().min(1).max(1000).required().messages({
    "string.min": "Query cannot be empty",
    "string.max": "Query cannot exceed 1000 characters",
    "any.required": "Query is required",
  }),
  language: Joi.string().valid("en", "am").optional(),
});

// Public chat endpoint (with stricter rate limiting)
router.post(
  "/message",
  optionalAuth,
  strictAiRateLimiter,
  validateBody(sendMessageSchema),
  sendMessage
);

// Quick recommendations
router.post(
  "/recommendations",
  optionalAuth,
  aiRateLimiter,
  validateBody(recommendationQuerySchema),
  getQuickRecommendations
);

// Suggested questions
router.get("/suggested-questions", getSuggestedQuestions);

// Protected session management
router.get(
  "/session/:sessionId",
  authenticate,
  validateParams(sessionIdParamSchema),
  getSessionHistory
);

router.delete(
  "/session/:sessionId",
  authenticate,
  validateParams(sessionIdParamSchema),
  clearSession
);

export default router;
