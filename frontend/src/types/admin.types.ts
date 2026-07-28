export interface IAdminPermissions {
  canManageServices: boolean;
  canManageApplications: boolean;
  canManageAdmins: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canManageAI: boolean;
}

export interface IAdmin {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: AdminRole;
  permissions: IAdminPermissions;
  department: string;
  position: string;
  employeeId: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin: string | null;
  profileImage: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AdminRole = "super_admin" | "admin" | "officer" | "viewer";

export const ADMIN_ROLE_LABELS: Record<AdminRole, { en: string; am: string }> =
  {
    super_admin: { en: "Super Admin", am: "ዋና አስተዳዳሪ" },
    admin: { en: "Admin", am: "አስተዳዳሪ" },
    officer: { en: "Officer", am: "ባለስልጣን" },
    viewer: { en: "Viewer", am: "ተመልካች" },
  };

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  admin: IAdmin;
  accessToken: string;
  expiresIn: number;
}
