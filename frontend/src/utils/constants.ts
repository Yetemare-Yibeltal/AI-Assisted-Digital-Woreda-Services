export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
export const APP_NAME =
  import.meta.env.VITE_APP_NAME || "Dangila Digital Woreda Services";
export const APP_URL = import.meta.env.VITE_APP_URL || "http://localhost:5173";
export const AI_ENABLED = import.meta.env.VITE_AI_ENABLED === "true";

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const DATE_FORMAT = {
  FULL: "MMMM D, YYYY",
  SHORT: "MMM D, YYYY",
  ISO: "YYYY-MM-DD",
  TIME: "h:mm A",
  DATETIME: "MMM D, YYYY h:mm A",
};

export const WOREDA_INFO = {
  name: "Dangila",
  nameAmharic: "ዳንግላ",
  region: "Amhara",
  regionAmharic: "አማራ",
  zone: "Awi",
  zoneAmharic: "አዊ",
  country: "Ethiopia",
  countryAmharic: "ኢትዮጵያ",
};

export const NAVIGATION = {
  HOME: "/",
  SERVICES: "/services",
  SERVICE_DETAIL: "/services/:slug",
  APPLY: "/apply/:slug",
  TRACK: "/track",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_APPLICATIONS: "/admin/applications",
  ADMIN_SERVICES: "/admin/services",
  ADMIN_ADMINS: "/admin/admins",
  ADMIN_SETTINGS: "/admin/settings",
};
