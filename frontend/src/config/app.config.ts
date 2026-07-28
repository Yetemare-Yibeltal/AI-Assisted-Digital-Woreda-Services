const BASE = "/api/v1";

export const apiEndpoints = {
  // Health
  health: "/health",
  root: BASE,

  // Public
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

  // Auth
  auth: {
    login: `${BASE}/auth/login`,
    refreshToken: `${BASE}/auth/refresh-token`,
    forgotPassword: `${BASE}/auth/forgot-password`,
    resetPassword: `${BASE}/auth/reset-password`,
    logout: `${BASE}/auth/logout`,
    me: `${BASE}/auth/me`,
  },

  // Services (Admin)
  services: {
    list: `${BASE}/services`,
    byId: (id: string) => `${BASE}/services/${id}`,
    bySlug: (slug: string) => `${BASE}/services/slug/${slug}`,
    create: `${BASE}/services`,
    update: (id: string) => `${BASE}/services/${id}`,
    delete: (id: string) => `${BASE}/services/${id}`,
    toggleStatus: (id: string) => `${BASE}/services/${id}/toggle`,
    popular: `${BASE}/services/popular`,
    categories: `${BASE}/services/categories`,
    search: `${BASE}/services/search`,
    byCategory: (category: string) => `${BASE}/services/category/${category}`,
    bulkUpdate: `${BASE}/services/bulk-update`,
  },

  // Applications
  applications: {
    list: `${BASE}/applications`,
    stats: `${BASE}/applications/stats`,
    byId: (id: string) => `${BASE}/applications/${id}`,
    byTrackingNumber: (trackingNumber: string) =>
      `${BASE}/applications/tracking/${trackingNumber}`,
    create: `${BASE}/applications`,
    updateStatus: (id: string) => `${BASE}/applications/${id}/status`,
    assign: (id: string) => `${BASE}/applications/${id}/assign`,
    updatePriority: (id: string) => `${BASE}/applications/${id}/priority`,
    addDocument: (id: string) => `${BASE}/applications/${id}/documents`,
    verifyDocument: (id: string, documentId: string) =>
      `${BASE}/applications/${id}/documents/${documentId}/verify`,
    delete: (id: string) => `${BASE}/applications/${id}`,
  },

  // Admin
  admin: {
    list: `${BASE}/admin`,
    byId: (id: string) => `${BASE}/admin/${id}`,
    create: `${BASE}/admin`,
    update: (id: string) => `${BASE}/admin/${id}`,
    delete: (id: string) => `${BASE}/admin/${id}`,
    toggleStatus: (id: string) => `${BASE}/admin/${id}/toggle-status`,
    changePassword: (id: string) => `${BASE}/admin/${id}/change-password`,
    permissions: (id: string) => `${BASE}/admin/${id}/permissions`,
    unlock: (id: string) => `${BASE}/admin/${id}/unlock`,
    byDepartment: (department: string) =>
      `${BASE}/admin/department/${department}`,
  },

  // Dashboard
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
    peakAnalysis: `${BASE}/dashboard/peak-analysis`,
    export: `${BASE}/dashboard/export`,
  },

  // PDF
  pdf: {
    receipt: (id: string) => `${BASE}/pdf/receipt/${id}`,
    certificate: (id: string) => `${BASE}/pdf/certificate/${id}`,
    documentRequest: (id: string) => `${BASE}/pdf/document-request/${id}`,
  },

  // AI
  ai: {
    status: `${BASE}/ai/status`,
    chat: {
      sendMessage: `${BASE}/ai/chat/message`,
      quickRecommendations: `${BASE}/ai/chat/recommendations`,
      suggestedQuestions: `${BASE}/ai/chat/suggested-questions`,
      session: (sessionId: string) => `${BASE}/ai/chat/session/${sessionId}`,
    },
    recommendations: {
      get: `${BASE}/ai/recommendations`,
      compare: `${BASE}/ai/recommendations/compare`,
      popular: `${BASE}/ai/recommendations/popular`,
      byCategory: (category: string) =>
        `${BASE}/ai/recommendations/category/${category}`,
    },
  },
} as const;

export type ApiEndpoints = typeof apiEndpoints;
export default apiEndpoints;
