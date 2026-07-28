import config from "./index";

const corsOrigins: string[] = [
  config.urls.frontend,
  "http://localhost:5173",
  "http://localhost:3000",
];

const corsMethods: string[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const corsAllowedHeaders: string[] = [
  "Content-Type",
  "Authorization",
  "X-Requested-With",
  "Accept",
];
const corsExposedHeaders: string[] = ["Content-Range", "X-Content-Range"];

const appConfig = {
  apiPrefix: "/api/v1",

  cors: {
    origin: corsOrigins,
    credentials: true as const,
    methods: corsMethods,
    allowedHeaders: corsAllowedHeaders,
    exposedHeaders: corsExposedHeaders,
    maxAge: 86400,
  },

  bodyLimit: "10mb",

  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  },

  applicationStatuses: [
    "pending",
    "under_review",
    "documents_requested",
    "approved",
    "rejected",
    "completed",
  ] as const,

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

  woreda: {
    name: "Dangila",
    region: "Amhara",
    zone: "Awi",
  },
} as const;

export default appConfig;
