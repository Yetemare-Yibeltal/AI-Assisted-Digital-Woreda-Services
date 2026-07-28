export const appConfig = {
  name: import.meta.env.VITE_APP_NAME || "Dangila Digital Woreda Services",
  shortName: "Dangila Woreda",
  version: "1.0.0",
  description:
    "AI-Assisted Digital Woreda Services for Dangila, Amhara Region, Ethiopia",
  url: import.meta.env.VITE_APP_URL || "http://localhost:5173",

  woreda: {
    name: "Dangila",
    nameAmharic: "ዳንግላ",
    region: "Amhara",
    regionAmharic: "አማራ",
    zone: "Awi",
    zoneAmharic: "አዊ",
    country: "Ethiopia",
    countryAmharic: "ኢትዮጵያ",
  },

  features: {
    aiChat: import.meta.env.VITE_AI_ENABLED === "true",
    aiRecommendations: import.meta.env.VITE_AI_ENABLED === "true",
    aiTranslation: import.meta.env.VITE_AI_ENABLED === "true",
    voiceInput: false,
    darkMode: true,
    notifications: true,
    pdfGeneration: true,
    multiLanguage: true,
  },

  language: {
    default: "en" as const,
    supported: ["en", "am"] as const,
    fallback: "en" as const,
    direction: "ltr" as const,
  },

  pagination: {
    defaultPageSize: 12,
    pageSizeOptions: [6, 12, 24, 48],
    maxPageSize: 100,
  },

  date: {
    format: "MMM D, YYYY",
    formatShort: "MM/DD/YYYY",
    formatTime: "h:mm A",
    formatDateTime: "MMM D, YYYY h:mm A",
    timezone: "Africa/Addis_Ababa",
  },

  currency: {
    code: "ETB",
    symbol: "Br",
    locale: "en-ET",
  },

  upload: {
    maxFileSize: 5 * 1024 * 1024,
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedDocumentTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
    maxFiles: 5,
  },

  session: {
    tokenRefreshMargin: 5 * 60 * 1000,
    idleTimeout: 30 * 60 * 1000,
  },

  animation: {
    pageTransition: true,
    reducedMotion: false,
    threeBackground: true,
  },
} as const;

export type AppConfig = typeof appConfig;
export default appConfig;
