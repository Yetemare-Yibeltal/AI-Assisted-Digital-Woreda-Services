import Joi from "joi";

const ethiopianPhonePattern = /^(\+251|0)[9][0-9]{8}$/;
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const applicantInfoSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(200).required().messages({
    "string.min": "Full name must be at least 3 characters",
    "string.max": "Full name cannot exceed 200 characters",
    "any.required": "Full name is required",
  }),
  fullNameAmharic: Joi.string().trim().min(3).max(200).required().messages({
    "string.min": "Full name in Amharic must be at least 3 characters",
    "string.max": "Full name in Amharic cannot exceed 200 characters",
    "any.required": "Full name in Amharic is required",
  }),
  dateOfBirth: Joi.date().max("now").required().messages({
    "date.max": "Date of birth cannot be in the future",
    "any.required": "Date of birth is required",
  }),
  gender: Joi.string().valid("male", "female").required().messages({
    "any.only": "Gender must be either male or female",
    "any.required": "Gender is required",
  }),
  phoneNumber: Joi.string().pattern(ethiopianPhonePattern).required().messages({
    "string.pattern.base":
      "Please provide a valid Ethiopian phone number (e.g., 0912345678 or +251912345678)",
    "any.required": "Phone number is required",
  }),
  email: Joi.string().email().max(100).allow("").optional().messages({
    "string.email": "Please provide a valid email address",
  }),
  idNumber: Joi.string().trim().max(50).allow("").optional(),
  occupation: Joi.string().trim().max(100).allow("").optional(),
});

const addressSchema = Joi.object({
  region: Joi.string().trim().max(100).required().messages({
    "any.required": "Region is required",
  }),
  zone: Joi.string().trim().max(100).required().messages({
    "any.required": "Zone is required",
  }),
  woreda: Joi.string().trim().max(100).required().messages({
    "any.required": "Woreda is required",
  }),
  kebele: Joi.string().trim().max(50).required().messages({
    "any.required": "Kebele is required",
  }),
  houseNumber: Joi.string().trim().max(50).allow("").optional(),
  poBox: Joi.string().trim().max(20).allow("").optional(),
});

const createApplicationSchema = Joi.object({
  service: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "Invalid service ID format",
    "any.required": "Service ID is required",
  }),
  applicantInfo: applicantInfoSchema.required().messages({
    "any.required": "Applicant information is required",
  }),
  address: addressSchema.required().messages({
    "any.required": "Address information is required",
  }),
  notes: Joi.string().trim().max(1000).allow("").optional(),
  notificationPreference: Joi.string().valid("sms", "email", "both").default("sms"),
  language: Joi.string().valid("en", "am").default("am"),
});

const updateApplicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "under_review", "documents_requested", "approved", "rejected", "completed")
    .required()
    .messages({
      "any.only": "Invalid application status",
      "any.required": "Application status is required",
    }),
  notes: Joi.string().trim().max(2000).required().messages({
    "string.max": "Notes cannot exceed 2000 characters",
    "any.required": "Status update notes are required",
  }),
  rejectionReason: Joi.string()
    .trim()
    .max(500)
    .when("status", {
      is: "rejected",
      then: Joi.required().messages({
        "any.required": "Rejection reason is required when rejecting an application",
      }),
      otherwise: Joi.optional(),
    }),
  priority: Joi.string().valid("low", "medium", "high", "urgent").optional(),
  assignedTo: Joi.string().pattern(objectIdPattern).optional().messages({
    "string.pattern.base": "Invalid admin ID format",
  }),
});

const applicationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "status", "priority", "applicantInfo.fullName")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  search: Joi.string().trim().max(100).allow("").default(""),
  status: Joi.string().valid(
    "pending",
    "under_review",
    "documents_requested",
    "approved",
    "rejected",
    "completed"
  ),
  priority: Joi.string().valid("low", "medium", "high", "urgent"),
  service: Joi.string().pattern(objectIdPattern),
  serviceCategory: Joi.string().valid(
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
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).messages({
    "date.min": "End date must be after start date",
  }),
  assignedTo: Joi.string().pattern(objectIdPattern),
  phoneNumber: Joi.string().pattern(ethiopianPhonePattern),
});

const applicationIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "Invalid application ID format",
    "any.required": "Application ID is required",
  }),
});

const trackingNumberParamSchema = Joi.object({
  trackingNumber: Joi.string()
    .pattern(/^DNG-\d{8}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid tracking number format (e.g., DNG-00000001)",
      "any.required": "Tracking number is required",
    }),
});

const documentUploadSchema = Joi.object({
  documentType: Joi.string().trim().max(100).required().messages({
    "any.required": "Document type is required",
  }),
});

export {
  createApplicationSchema,
  updateApplicationStatusSchema,
  applicationQuerySchema,
  applicationIdParamSchema,
  trackingNumberParamSchema,
  documentUploadSchema,
};

export default {
  createApplicationSchema,
  updateApplicationStatusSchema,
  applicationQuerySchema,
  applicationIdParamSchema,
  trackingNumberParamSchema,
  documentUploadSchema,
};
