import Joi from "joi";

export const recommendationQuerySchema = Joi.object({
  query: Joi.string().min(3).max(1000).required().messages({
    "string.min": "Query must be at least 3 characters",
    "string.max": "Query cannot exceed 1000 characters",
    "any.required": "Query is required",
  }),
  language: Joi.string().valid("en", "am").optional().default("en"),
  maxResults: Joi.number().integer().min(1).max(10).default(5),
});

export const recommendationCategoryParams = Joi.object({
  category: Joi.string()
    .valid(
      "civil_registration",
      "land_administration",
      "business_licensing",
      "tax_services",
      "social_services",
      "infrastructure",
      "education",
      "health",
      "agriculture",
      "legal_services",
      "other"
    )
    .required()
    .messages({
      "any.required": "Category is required",
      "any.only": "Invalid service category",
    }),
});

export const compareServicesSchema = Joi.object({
  serviceSlugs: Joi.array().items(Joi.string().min(1).max(100)).min(2).max(5).required().messages({
    "array.min": "At least 2 services required for comparison",
    "array.max": "Maximum 5 services can be compared",
    "any.required": "Service slugs are required",
  }),
  language: Joi.string().valid("en", "am").optional().default("en"),
});
