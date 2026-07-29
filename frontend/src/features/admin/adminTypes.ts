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
  role: "super_admin" | "admin" | "officer" | "viewer";
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
