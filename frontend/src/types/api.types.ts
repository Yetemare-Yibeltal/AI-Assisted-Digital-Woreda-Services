export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: {
    code: string;
    message: string;
    statusCode: number;
    details?: unknown;
  };
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
  timestamp: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  [key: string]: unknown;
}

export interface DashboardOverview {
  overview: {
    applications: {
      total: number;
      today: number;
      yesterday: number;
      thisWeek: number;
      thisMonth: number;
      thisYear: number;
    };
    services: {
      total: number;
      active: number;
      inactive: number;
    };
    staff: {
      total: number;
      active: number;
      inactive: number;
    };
    citizens: {
      totalServed: number;
      thisMonth: number;
    };
  };
  statusBreakdown: {
    pending: number;
    underReview: number;
    approvedToday: number;
    rejectedToday: number;
    completedToday: number;
    overdue: number;
    pendingDocumentVerifications: number;
    highPriorityPending: number;
    urgentPending: number;
  };
  performance: {
    approvalRate: number;
    rejectionRate: number;
    averageProcessingDays: number;
  };
  notifications: {
    unread: number;
  };
}
