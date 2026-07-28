import { Request, Response } from "express";
import * as adminService from "../services/adminService";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from "../utils/responseFormatter";

const getAllAdmins = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.getAllAdmins(req.query);
  sendPaginated(
    res,
    result.admins,
    {
      page: result.page,
      limit: result.limit,
      totalItems: result.totalItems,
    },
    "Admins retrieved successfully"
  );
});

const getAdminById = asyncHandler(async (req: Request, res: Response) => {
  const admin = await adminService.getAdminById(req.params.id);
  sendSuccess(res, admin, "Admin retrieved successfully");
});

const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const createdBy = req.user?.id || "system";
  const admin = await adminService.createAdmin(req.body, createdBy);
  sendCreated(res, admin, "Admin created successfully");
});

const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const updatedBy = req.user?.id || "system";
  const admin = await adminService.updateAdmin(req.params.id, req.body, updatedBy);
  sendSuccess(res, admin, "Admin updated successfully");
});

const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.user?.id || "";
  await adminService.deleteAdmin(req.params.id, currentUserId);
  sendSuccess(res, null, "Admin deleted successfully");
});

const toggleAdminStatus = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.user?.id || "";
  const admin = await adminService.toggleAdminStatus(req.params.id, currentUserId);
  const statusMessage = admin.isActive ? "activated" : "deactivated";
  sendSuccess(res, admin, `Admin account ${statusMessage} successfully`);
});

const updatePermissions = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.user?.id || "";
  const admin = await adminService.updatePermissions(
    req.params.id,
    req.body.permissions,
    currentUserId
  );
  sendSuccess(res, admin, "Permissions updated successfully");
});

const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await adminService.changePassword(req.params.id, currentPassword, newPassword);
  sendSuccess(res, null, "Password changed successfully");
});

const unlockAccount = asyncHandler(async (req: Request, res: Response) => {
  const admin = await adminService.unlockAccount(req.params.id);
  sendSuccess(res, admin, "Account unlocked successfully");
});

const getAdminsByDepartment = asyncHandler(async (req: Request, res: Response) => {
  const admins = await adminService.getAdminsByDepartment(req.params.department);
  sendSuccess(res, admins, "Admins by department retrieved successfully");
});

export {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
  updatePermissions,
  changePassword,
  unlockAccount,
  getAdminsByDepartment,
};

export default {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
  updatePermissions,
  changePassword,
  unlockAccount,
  getAdminsByDepartment,
};
