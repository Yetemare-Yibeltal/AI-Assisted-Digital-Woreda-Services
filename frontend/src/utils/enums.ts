export const APPLICATION_STATUSES = [
  "pending",
  "under_review",
  "documents_requested",
  "approved",
  "rejected",
  "completed",
] as const;

export const PRIORITY_LEVELS = ["low", "medium", "high", "urgent"] as const;

export const ADMIN_ROLES = [
  "super_admin",
  "admin",
  "officer",
  "viewer",
] as const;

export const SERVICE_CATEGORIES = [
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
  "other",
] as const;

export const GENDER_OPTIONS = ["male", "female"] as const;

export const NOTIFICATION_PREFERENCES = ["sms", "email", "both"] as const;

export const LANGUAGES = ["en", "am"] as const;

export const DOCUMENT_TYPES = [
  "birth_certificate",
  "death_certificate",
  "marriage_certificate",
  "divorce_certificate",
  "id_card",
  "residence_permit",
  "land_title_deed",
  "business_license",
  "tax_clearance",
  "educational_transcript",
  "medical_certificate",
  "other",
] as const;
