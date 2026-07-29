const BASE = "/api/v1";

export const apiEndpoints = {
  health: "/health",
  root: BASE,
  public: {
    services: `${BASE}/public/services`,
    popularServices: `${BASE}/public/services/popular`,
    serviceCategories: `${BASE}/public/services/categories`,
    searchServices: `${BASE}/public/services/search`,
    serviceBySlug: (slug: string) => `${BASE}/public/services/slug/${slug}`,
    submitApplication: `${BASE}/public/applications`,
    trackApplication: (trackingNumber: string) =>
      `${BASE}/public/applications/track/${trackingNumber}`,
  },
  auth: {
    login: `${BASE}/auth/login`,
    refreshToken: `${BASE}/auth/refresh-token`,
    forgotPassword: `${BASE}/auth/forgot-password`,
    resetPassword: `${BASE}/auth/reset-password`,
    logout: `${BASE}/auth/logout`,
    me: `${BASE}/auth/me`,
  },
  services: {
    list: `${BASE}/services`,
    byId: (id: string) => `${BASE}/services/${id}`,
    bySlug: (slug: string) => `${BASE}/services/slug/${slug}`,
    create: `${BASE}/services`,
    update: (id: string) => `${BASE}/services/${id}`,
    delete: (id: string) => `${BASE}/services/${id}`,
    toggleStatus: (id: string) => `${BASE}/services/${id}/toggle`,
  },
  applications: {
    list: `${BASE}/applications`,
    byId: (id: string) => `${BASE}/applications/${id}`,
    create: `${BASE}/applications`,
    updateStatus: (id: string) => `${BASE}/applications/${id}/status`,
    assign: (id: string) => `${BASE}/applications/${id}/assign`,
  },
  dashboard: {
    overview: `${BASE}/dashboard/overview`,
    statusDistribution: `${BASE}/dashboard/status-distribution`,
    trends: `${BASE}/dashboard/trends`,
    servicePerformance: `${BASE}/dashboard/service-performance`,
    officerWorkload: `${BASE}/dashboard/officer-workload`,
    processingTimes: `${BASE}/dashboard/processing-times`,
    citizenDemographics: `${BASE}/dashboard/citizen-demographics`,
    revenue: `${BASE}/dashboard/revenue`,
    deadlines: `${BASE}/dashboard/deadlines`,
    recentActivity: `${BASE}/dashboard/recent-activity`,
  },
  pdf: {
    receipt: (id: string) => `${BASE}/pdf/receipt/${id}`,
    certificate: (id: string) => `${BASE}/pdf/certificate/${id}`,
    documentRequest: (id: string) => `${BASE}/pdf/document-request/${id}`,
  },
  ai: {
    status: `${BASE}/ai/status`,
    chatMessage: `${BASE}/ai/chat/message`,
    recommendations: `${BASE}/ai/recommendations`,
    translate: `${BASE}/ai/translations/translate`,
    documentScan: `${BASE}/ai/documents/scan`,
    documentVerify: `${BASE}/ai/documents/verify`,
    formAssist: `${BASE}/ai/form/assist`,
  },
};

export default apiEndpoints;
