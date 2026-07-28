import Admin, { IAdmin, IAdminPermissions } from "../models/Admin";
import { NotFoundError } from "../errors/NotFoundError";
import { AppError } from "../errors/AppError";
import { AuthorizationError } from "../errors/AuthorizationError";
import { AuthenticationError } from "../errors/AuthenticationError";
import {
  extractPaginationParams,
  buildPaginationOptions,
  buildSearchQuery,
} from "../utils/pagination";

const getAllAdmins = async (queryParams: any) => {
  const params = extractPaginationParams(queryParams);
  const options = buildPaginationOptions(params);

  const filter: any = {};

  if (queryParams.role) filter.role = queryParams.role;
  if (queryParams.department) filter.department = queryParams.department;
  if (queryParams.isActive !== undefined) {
    filter.isActive = queryParams.isActive === "true" || queryParams.isActive === true;
  }

  const searchQuery = buildSearchQuery(params.search, [
    "fullName",
    "email",
    "phoneNumber",
    "department",
    "position",
    "employeeId",
  ]);

  const finalFilter = { ...filter, ...searchQuery };

  const [admins, totalItems] = await Promise.all([
    Admin.find(finalFilter)
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit)
      .select("-password -refreshToken -passwordResetToken -passwordResetExpires -__v")
      .populate("createdBy", "fullName email")
      .lean(),
    Admin.countDocuments(finalFilter),
  ]);

  return {
    admins: admins as unknown as IAdmin[],
    totalItems,
    page: params.page,
    limit: params.limit,
  };
};

const getAdminById = async (id: string): Promise<IAdmin> => {
  const admin = await Admin.findById(id)
    .select("-password -refreshToken -passwordResetToken -passwordResetExpires -__v")
    .populate("createdBy", "fullName email");

  if (!admin) {
    throw NotFoundError.admin(id);
  }

  return admin;
};

const createAdmin = async (adminData: Partial<IAdmin>, createdBy: string): Promise<IAdmin> => {
  const existingEmail = await Admin.findOne({ email: adminData.email });
  if (existingEmail) {
    throw AppError.conflict(
      `Admin with email '${adminData.email}' already exists`,
      "DUPLICATE_EMAIL"
    );
  }

  const existingPhone = await Admin.findOne({ phoneNumber: adminData.phoneNumber });
  if (existingPhone) {
    throw AppError.conflict(
      `Admin with phone number '${adminData.phoneNumber}' already exists`,
      "DUPLICATE_PHONE"
    );
  }

  if (adminData.employeeId) {
    const existingEmployeeId = await Admin.findOne({
      employeeId: adminData.employeeId,
    });
    if (existingEmployeeId) {
      throw AppError.conflict(
        `Admin with employee ID '${adminData.employeeId}' already exists`,
        "DUPLICATE_EMPLOYEE_ID"
      );
    }
  }

  const admin = await Admin.create({
    ...adminData,
    createdBy,
    isVerified: true,
  });

  return admin;
};

const updateAdmin = async (
  id: string,
  updateData: Partial<IAdmin>,
  updatedBy: string
): Promise<IAdmin> => {
  const admin = await Admin.findById(id);
  if (!admin) {
    throw NotFoundError.admin(id);
  }

  if (updateData.email && updateData.email !== admin.email) {
    const existingEmail = await Admin.findOne({
      email: updateData.email,
      _id: { $ne: id },
    });
    if (existingEmail) {
      throw AppError.conflict(`Email '${updateData.email}' is already in use`, "DUPLICATE_EMAIL");
    }
  }

  if (updateData.phoneNumber && updateData.phoneNumber !== admin.phoneNumber) {
    const existingPhone = await Admin.findOne({
      phoneNumber: updateData.phoneNumber,
      _id: { $ne: id },
    });
    if (existingPhone) {
      throw AppError.conflict(
        `Phone number '${updateData.phoneNumber}' is already in use`,
        "DUPLICATE_PHONE"
      );
    }
  }

  Object.assign(admin, updateData);
  await admin.save();

  return admin;
};

const deleteAdmin = async (id: string, currentUserId: string): Promise<void> => {
  if (id === currentUserId) {
    throw AppError.badRequest("You cannot delete your own account", "CANNOT_DELETE_SELF");
  }

  const admin = await Admin.findById(id);
  if (!admin) {
    throw NotFoundError.admin(id);
  }

  if (admin.role === "super_admin") {
    throw AuthorizationError.superAdminOnly();
  }

  await Admin.findByIdAndDelete(id);
};

const toggleAdminStatus = async (id: string, currentUserId: string): Promise<IAdmin> => {
  if (id === currentUserId) {
    throw AppError.badRequest("You cannot deactivate your own account", "CANNOT_DEACTIVATE_SELF");
  }

  const admin = await Admin.findById(id);
  if (!admin) {
    throw NotFoundError.admin(id);
  }

  if (admin.role === "super_admin" && !admin.isActive) {
    throw AuthorizationError.superAdminOnly();
  }

  admin.isActive = !admin.isActive;
  admin.loginAttempts = 0;
  admin.lockUntil = null;
  await admin.save();

  return admin;
};

const updatePermissions = async (
  id: string,
  permissions: IAdminPermissions,
  currentUserId: string
): Promise<IAdmin> => {
  const admin = await Admin.findById(id);
  if (!admin) {
    throw NotFoundError.admin(id);
  }

  if (admin.role === "super_admin") {
    throw AppError.badRequest(
      "Cannot modify permissions of a super admin",
      "CANNOT_MODIFY_SUPER_ADMIN"
    );
  }

  admin.permissions = permissions;
  await admin.save();

  return admin;
};

const changePassword = async (
  id: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const admin = await Admin.findById(id).select("+password");
  if (!admin) {
    throw NotFoundError.admin(id);
  }

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    throw AuthenticationError.invalidCredentials();
  }

  admin.password = newPassword;
  admin.passwordChangedAt = new Date();
  admin.refreshToken = null;
  await admin.save();
};

const unlockAccount = async (id: string): Promise<IAdmin> => {
  const admin = await Admin.findById(id);
  if (!admin) {
    throw NotFoundError.admin(id);
  }

  admin.loginAttempts = 0;
  admin.lockUntil = null;
  await admin.save();

  return admin;
};

const getAdminsByDepartment = async (department: string): Promise<IAdmin[]> => {
  const admins = await Admin.find({
    department,
    isActive: true,
  })
    .select("fullName email phoneNumber role position")
    .lean();

  return admins as unknown as IAdmin[];
};

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
