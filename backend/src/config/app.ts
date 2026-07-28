import config from "./index";

const appConfig = {
  // API version prefix
  apiPrefix: "/api/v1",

  // CORS configuration
  cors: {
    origin: [config.urls.frontend, "http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400,
  },

  // Request body limits
  bodyLimit: "10mb",

  // Pagination defaults
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  },

  // Application statuses
  applicationStatuses: [
    "pending",
    "under_review",
    "documents_requested",
    "approved",
    "rejected",
    "completed",
  ] as const,

  // Service categories
  serviceCategories: [
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
  ] as const,

  // Document types
  documentTypes: [
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
  ] as const,

  // Ethiopian regions (for address forms)
  regions: [
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
  ],

  // Woreda specific
  woreda: {
    name: "Dangila",
    region: "Amhara",
    zone: "Awi",
  },
} as const;

export default appConfig;
