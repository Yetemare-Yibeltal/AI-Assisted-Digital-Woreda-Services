import Joi from "joi";

const ethiopianPhonePattern = /^(\+251|0)[9][0-9]{8}$/;
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

const createAdminSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(100).required().messages({
    "string.min": "Full name must be at least 3 characters",
    "string.max": "Full name cannot exceed 100 characters",
    "any.required": "Full name is required",
  }),
  email: Joi.string().email().max(100).required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  phoneNumber: Joi.string().pattern(ethiopianPhonePattern).required().messages({
    "string.pattern.base": "Please provide a valid Ethiopian phone number",
    "any.required": "Phone number is required",
  }),
  password: Joi.string().pattern(passwordPattern).required().messages({
    "string.pattern.base":
      "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
    "any.required": "Password is required",
  }),
  role: Joi.string()
    .valid("super_admin", "admin", "officer", "viewer")
    .default("officer")
    .messages({
      "any.only": "Role must be one of: super_admin, admin, officer, viewer",
    }),
  department: Joi.string().trim().max(100).default("General Administration"),
  position: Joi.string().trim().max(100).default("Service Officer"),
  employeeId: Joi.string().trim().max(50).optional(),
  permissions: Joi.object({
    canManageServices: Joi.boolean().default(false),
    canManageApplications: Joi.boolean().default(true),
    canManageAdmins: Joi.boolean().default(false),
    canViewReports: Joi.boolean().default(true),
    canExportData: Joi.boolean().default(false),
    canManageAI: Joi.boolean().default(false),
  }).default(),
});

const updateAdminSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(100),
  email: Joi.string().email().max(100),
  phoneNumber: Joi.string().pattern(ethiopianPhonePattern),
  role: Joi.string().valid("super_admin", "admin", "officer", "viewer"),
  department: Joi.string().trim().max(100),
  position: Joi.string().trim().max(100),
  employeeId: Joi.string().trim().max(50),
  isActive: Joi.boolean(),
  isVerified: Joi.boolean(),
  permissions: Joi.object({
    canManageServices: Joi.boolean(),
    canManageApplications: Joi.boolean(),
    canManageAdmins: Joi.boolean(),
    canViewReports: Joi.boolean(),
    canExportData: Joi.boolean(),
    canManageAI: Joi.boolean(),
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string().pattern(passwordPattern).required().messages({
    "string.pattern.base":
      "New password must be at least 8 characters with uppercase, lowercase, number, and special character",
    "any.required": "New password is required",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "Confirm password does not match new password",
    "any.required": "Confirm password is required",
  }),
});

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Reset token is required",
  }),
  newPassword: Joi.string().pattern(passwordPattern).required().messages({
    "string.pattern.base":
      "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
    "any.required": "New password is required",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "Confirm password does not match new password",
    "any.required": "Confirm password is required",
  }),
});

const adminQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string()
    .valid("fullName", "email", "role", "department", "createdAt")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  search: Joi.string().trim().max(100).default(""),
  role: Joi.string().valid("super_admin", "admin", "officer", "viewer"),
  department: Joi.string().trim().max(100),
  isActive: Joi.boolean(),
});

const adminIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "Invalid admin ID format",
    "any.required": "Admin ID is required",
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token is required",
  }),
});

export {
  createAdminSchema,
  updateAdminSchema,
  updatePasswordSchema,
  adminLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  adminQuerySchema,
  adminIdParamSchema,
  refreshTokenSchema,
};

export default {
  createAdminSchema,
  updateAdminSchema,
  updatePasswordSchema,
  adminLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  adminQuerySchema,
  adminIdParamSchema,
  refreshTokenSchema,
};
