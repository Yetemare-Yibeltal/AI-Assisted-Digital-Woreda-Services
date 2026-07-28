export const APPLICATION_STATUSES = [
  "pending",
  "under_review",
  "documents_requested",
  "approved",
  "rejected",
  "completed",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const PRIORITY_LEVELS = ["low", "medium", "high", "urgent"] as const;
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

export const ADMIN_ROLES = [
  "super_admin",
  "admin",
  "officer",
  "viewer",
] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

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

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const GENDER_OPTIONS = ["male", "female"] as const;
export type GenderOption = (typeof GENDER_OPTIONS)[number];

export const NOTIFICATION_PREFERENCES = ["sms", "email", "both"] as const;
export type NotificationPreference = (typeof NOTIFICATION_PREFERENCES)[number];

export const LANGUAGES = ["en", "am"] as const;
export type Language = (typeof LANGUAGES)[number];

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

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const ETHIOPIAN_REGIONS = [
  "Addis Ababa",
  "Afar",
  "Amhara",
  "Benishangul-Gumuz",
  "Dire Dawa",
  "Gambela",
  "Harari",
  "Oromia",
  "Sidama",
  "Somali",
  "South Ethiopia",
  "South West Ethiopia",
  "Tigray",
  "Central Ethiopia",
] as const;

export type EthiopianRegion = (typeof ETHIOPIAN_REGIONS)[number];

export const APPLICATION_STATUS_MAP: Record<
  ApplicationStatus,
  { en: string; am: string; color: string; bgColor: string; icon: string }
> = {
  pending: {
    en: "Pending",
    am: "በመጠባበቅ ላይ",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    icon: "Clock",
  },
  under_review: {
    en: "Under Review",
    am: "በግምገማ ላይ",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    icon: "Search",
  },
  documents_requested: {
    en: "Documents Requested",
    am: "ሰነዶች ተጠይቀዋል",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    icon: "FileWarning",
  },
  approved: {
    en: "Approved",
    am: "ጸድቋል",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    icon: "CheckCircle",
  },
  rejected: {
    en: "Rejected",
    am: "ውድቅ ተደርጓል",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    icon: "XCircle",
  },
  completed: {
    en: "Completed",
    am: "ተጠናቋል",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    icon: "CheckCircle2",
  },
};

export const PRIORITY_MAP: Record<
  PriorityLevel,
  { en: string; am: string; color: string; bgColor: string }
> = {
  low: {
    en: "Low",
    am: "ዝቅተኛ",
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
  },
  medium: {
    en: "Medium",
    am: "መካከለኛ",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  high: {
    en: "High",
    am: "ከፍተኛ",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
  },
  urgent: {
    en: "Urgent",
    am: "አስቸኳይ",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
  },
};

export const ADMIN_ROLE_MAP: Record<
  AdminRole,
  { en: string; am: string; color: string }
> = {
  super_admin: {
    en: "Super Admin",
    am: "ዋና አስተዳዳሪ",
    color: "text-red-400",
  },
  admin: {
    en: "Admin",
    am: "አስተዳዳሪ",
    color: "text-purple-400",
  },
  officer: {
    en: "Officer",
    am: "ባለስልጣን",
    color: "text-blue-400",
  },
  viewer: {
    en: "Viewer",
    am: "ተመልካች",
    color: "text-gray-400",
  },
};

export const SERVICE_CATEGORY_MAP: Record<
  ServiceCategory,
  { en: string; am: string; icon: string }
> = {
  civil_registration: {
    en: "Civil Registration",
    am: "ሲቪል ምዝገባ",
    icon: "Users",
  },
  land_administration: {
    en: "Land Administration",
    am: "የመሬት አስተዳደር",
    icon: "MapPin",
  },
  business_licensing: {
    en: "Business Licensing",
    am: "የንግድ ፈቃድ",
    icon: "Store",
  },
  tax_services: {
    en: "Tax Services",
    am: "የግብር አገልግሎት",
    icon: "Receipt",
  },
  social_services: {
    en: "Social Services",
    am: "ማህበራዊ አገልግሎት",
    icon: "Heart",
  },
  infrastructure: {
    en: "Infrastructure",
    am: "መሰረተ ልማት",
    icon: "Building",
  },
  education: {
    en: "Education",
    am: "ትምህርት",
    icon: "GraduationCap",
  },
  health: {
    en: "Health",
    am: "ጤና",
    icon: "Activity",
  },
  agriculture: {
    en: "Agriculture",
    am: "ግብርና",
    icon: "Leaf",
  },
  legal_services: {
    en: "Legal Services",
    am: "ህጋዊ አገልግሎት",
    icon: "Scale",
  },
  other: {
    en: "Other",
    am: "ሌላ",
    icon: "MoreHorizontal",
  },
};

export const GENDER_MAP: Record<GenderOption, { en: string; am: string }> = {
  male: { en: "Male", am: "ወንድ" },
  female: { en: "Female", am: "ሴት" },
};

export const NOTIFICATION_PREFERENCE_MAP: Record<
  NotificationPreference,
  { en: string; am: string }
> = {
  sms: { en: "SMS", am: "ኤስኤምኤስ" },
  email: { en: "Email", am: "ኢሜይል" },
  both: { en: "Both", am: "ሁለቱም" },
};

export const LANGUAGE_MAP: Record<
  Language,
  { en: string; am: string; flag: string }
> = {
  en: { en: "English", am: "እንግሊዘኛ", flag: "🇬🇧" },
  am: { en: "Amharic", am: "አማርኛ", flag: "🇪🇹" },
};

export const DOCUMENT_TYPE_MAP: Record<
  DocumentType,
  { en: string; am: string }
> = {
  birth_certificate: { en: "Birth Certificate", am: "የልደት ሰርተፍኬት" },
  death_certificate: { en: "Death Certificate", am: "የሞት ሰርተፍኬት" },
  marriage_certificate: { en: "Marriage Certificate", am: "የጋብቻ ሰርተፍኬት" },
  divorce_certificate: { en: "Divorce Certificate", am: "የፍቺ ሰርተፍኬት" },
  id_card: { en: "ID Card", am: "መታወቂያ ካርድ" },
  residence_permit: { en: "Residence Permit", am: "የመኖሪያ ፈቃድ" },
  land_title_deed: { en: "Land Title Deed", am: "የመሬት ይዞታ ማረጋገጫ" },
  business_license: { en: "Business License", am: "የንግድ ፈቃድ" },
  tax_clearance: { en: "Tax Clearance", am: "የግብር ክሊራንስ" },
  educational_transcript: {
    en: "Educational Transcript",
    am: "የትምህርት ትራንስክሪፕት",
  },
  medical_certificate: { en: "Medical Certificate", am: "የህክምና ሰርተፍኬት" },
  other: { en: "Other", am: "ሌላ" },
};
