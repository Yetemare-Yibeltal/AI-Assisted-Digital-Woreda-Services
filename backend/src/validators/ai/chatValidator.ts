import Joi from "joi";

export const chatMessageSchema = Joi.object({
  sessionId: Joi.string().max(100).optional().allow(""),
  message: Joi.string().min(1).max(2000).required().messages({
    "string.min": "Message cannot be empty",
    "string.max": "Message cannot exceed 2000 characters",
    "any.required": "Message is required",
  }),
  language: Joi.string().valid("en", "am").optional().default("en"),
});

export const chatSessionParamsSchema = Joi.object({
  sessionId: Joi.string().min(1).max(100).required().messages({
    "string.min": "Session ID is required",
    "any.required": "Session ID is required",
  }),
});

export const chatHistoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(20),
});
