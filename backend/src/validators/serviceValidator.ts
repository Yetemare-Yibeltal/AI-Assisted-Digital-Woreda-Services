import Joi from "joi";

const serviceStepSchema = Joi.object({
  stepNumber: Joi.number().integer().min(1).required().messages({
    "number.base": "Step number must be a number",
    "number.min": "Step number must be at least 1",
    "any.required": "Step number is required",
  }),
  title: Joi.string().trim().max(200).required().messages({
    "string.max": "Step title cannot exceed 200 characters",
    "any.required": "Step title in English is required",
  }),
  titleAmharic: Joi.string().trim().max(200).required().messages({
    "string.max": "Step title in Amharic cannot exceed 200 characters",
    "any.required": "Step title in Amharic is required",
  }),
  description: Joi.string().trim().max(1000).required().messages({
    "string.max": "Step description cannot exceed 1000 characters",
    "any.required": "Step description in English is required",
  }),
  descriptionAmharic: Joi.string().trim().max(1000).required().messages({
    "string.max": "Step description in Amharic cannot exceed 1000 characters",
    "any.required": "Step description in Amharic is required",
  }),
  estimatedTime: Joi.string().trim().max(100).default("Varies"),
  officeLocation: Joi.string().trim().max(200).default("Dangila Woreda Office"),
});

const requiredDocumentSchema = Joi.object({
  name: Joi.string().trim().max(200).required().messages({
    "any.required": "Document name in English is required",
  }),
  nameAmharic: Joi.string().trim().max(200).required().messages({
    "any.required": "Document name in Amharic is required",
  }),
  description: Joi.string().trim().max(500).required().messages({
    "any.required": "Document description in English is required",
  }),
  descriptionAmharic: Joi.string().trim().max(500).required().messages({
    "any.required": "Document description in Amharic is required",
  }),
  isMandatory: Joi.boolean().default(true),
  format: Joi.string().trim().default("PDF, JPG, PNG"),
  maxSize: Joi.number().integer().min(1024).default(5242880),
});

const feeSchema = Joi.object({
  name: Joi.string().trim().max(200).required().messages({
    "any.required": "Fee name in English is required",
  }),
  nameAmharic: Joi.string().trim().max(200).required().messages({
    "any.required": "Fee name in Amharic is required",
  }),
  amount: Joi.number().min(0).required().messages({
    "number.min": "Fee amount cannot be negative",
    "any.required": "Fee amount is required",
  }),
  currency: Joi.string().valid("ETB", "USD").default("ETB"),
  description: Joi.string().trim().max(500).default(""),
});

const createServiceSchema = Joi.object({
  name: Joi.string().trim().min(3).max(200).required().messages({
    "string.min": "Service name must be at least 3 characters",
    "string.max": "Service name cannot exceed 200 characters",
    "any.required": "Service name in English is required",
  }),
  nameAmharic: Joi.string().trim().min(3).max(200).required().messages({
    "string.min": "Service name in Amharic must be at least 3 characters",
    "string.max": "Service name in Amharic cannot exceed 200 characters",
    "any.required": "Service name in Amharic is required",
  }),
  slug: Joi.string().trim().lowercase().max(100),
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
      "any.only": "Invalid service category",
      "any.required": "Service category is required",
    }),
  description: Joi.string().trim().max(2000).required().messages({
    "string.max": "Description cannot exceed 2000 characters",
    "any.required": "Description in English is required",
  }),
  descriptionAmharic: Joi.string().trim().max(2000).required().messages({
    "string.max": "Description in Amharic cannot exceed 2000 characters",
    "any.required": "Description in Amharic is required",
  }),
  shortDescription: Joi.string().trim().max(300).required().messages({
    "string.max": "Short description cannot exceed 300 characters",
    "any.required": "Short description in English is required",
  }),
  shortDescriptionAmharic: Joi.string().trim().max(300).required().messages({
    "string.max": "Short description in Amharic cannot exceed 300 characters",
    "any.required": "Short description in Amharic is required",
  }),
  icon: Joi.string().trim().max(50).default("FileText"),
  steps: Joi.array().items(serviceStepSchema).min(1).required().messages({
    "array.min": "At least one step is required",
    "any.required": "Service steps are required",
  }),
  requiredDocuments: Joi.array().items(requiredDocumentSchema).default([]),
  fees: Joi.array().items(feeSchema).default([]),
  processingTime: Joi.string().trim().max(100).default("3-5 business days"),
  processingTimeAmharic: Joi.string().trim().max(100).default("ከ3-5 የስራ ቀናት"),
  eligibility: Joi.string().trim().max(500).default("All citizens of Dangila Woreda"),
  eligibilityAmharic: Joi.string().trim().max(500).default("ሁሉም የዳንግላ ወረዳ ነዋሪዎች"),
  isActive: Joi.boolean().default(true),
  isPopular: Joi.boolean().default(false),
  order: Joi.number().integer().min(0).default(0),
  tags: Joi.array().items(Joi.string().trim().max(50)).default([]),
});

const updateServiceSchema = Joi.object({
  name: Joi.string().trim().min(3).max(200),
  nameAmharic: Joi.string().trim().min(3).max(200),
  slug: Joi.string().trim().lowercase().max(100),
  category: Joi.string().valid(
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
  ),
  description: Joi.string().trim().max(2000),
  descriptionAmharic: Joi.string().trim().max(2000),
  shortDescription: Joi.string().trim().max(300),
  shortDescriptionAmharic: Joi.string().trim().max(300),
  icon: Joi.string().trim().max(50),
  steps: Joi.array().items(serviceStepSchema).min(1),
  requiredDocuments: Joi.array().items(requiredDocumentSchema),
  fees: Joi.array().items(feeSchema),
  processingTime: Joi.string().trim().max(100),
  processingTimeAmharic: Joi.string().trim().max(100),
  eligibility: Joi.string().trim().max(500),
  eligibilityAmharic: Joi.string().trim().max(500),
  isActive: Joi.boolean(),
  isPopular: Joi.boolean(),
  order: Joi.number().integer().min(0),
  tags: Joi.array().items(Joi.string().trim().max(50)),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

const serviceQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string()
    .valid("name", "category", "order", "createdAt", "updatedAt")
    .default("order"),
  sortOrder: Joi.string().valid("asc", "desc").default("asc"),
  search: Joi.string().trim().max(100).default(""),
  category: Joi.string().valid(
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
  ),
  isActive: Joi.boolean(),
  isPopular: Joi.boolean(),
  tags: Joi.string().trim(),
});

const serviceIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid service ID format",
      "any.required": "Service ID is required",
    }),
});

export { createServiceSchema, updateServiceSchema, serviceQuerySchema, serviceIdParamSchema };

export default {
  createServiceSchema,
  updateServiceSchema,
  serviceQuerySchema,
  serviceIdParamSchema,
};
