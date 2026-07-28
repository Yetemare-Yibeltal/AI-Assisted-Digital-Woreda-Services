import jwt from "jsonwebtoken";
import crypto from "crypto";
import Admin, { IAdmin } from "../models/Admin";
import config from "../config/index";
import { AuthenticationError } from "../errors/AuthenticationError";
import { AppError } from "../errors/AppError";
import { generateResetToken } from "../utils/encryption";
import { sendSuccess } from "../utils/responseFormatter";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const login = async (
  email: string,
  password: string
): Promise<{ admin: IAdmin; tokens: TokenPair }> => {
  const admin = await Admin.findByCredentials(email, password);

  const tokens = generateTokenPair(admin);

  admin.refreshToken = tokens.refreshToken;
  await admin.save({ validateBeforeSave: false });

  const adminObj = admin.toObject();
  delete (adminObj as any).password;
  delete (adminObj as any).refreshToken;
  delete (adminObj as any).passwordResetToken;
  delete (adminObj as any).passwordResetExpires;

  return { admin: adminObj as IAdmin, tokens };
};

const refreshTokens = async (
  refreshToken: string
): Promise<{ admin: IAdmin; tokens: TokenPair }> => {
  let decoded: any;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.secret);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw AuthenticationError.tokenExpired();
    }
    throw AuthenticationError.invalidRefreshToken();
  }

  const admin = await Admin.findById(decoded.id).select("+refreshToken");
  if (!admin) {
    throw AuthenticationError.tokenInvalid();
  }

  if (!admin.isActive) {
    throw AuthenticationError.accountDisabled();
  }

  if (admin.isLocked) {
    throw AuthenticationError.accountLocked(admin.lockUntil || undefined);
  }

  if (admin.refreshToken !== refreshToken) {
    admin.refreshToken = null;
    await admin.save({ validateBeforeSave: false });
    throw AuthenticationError.invalidRefreshToken();
  }

  const tokens = generateTokenPair(admin);

  admin.refreshToken = tokens.refreshToken;
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  const adminObj = admin.toObject();
  delete (adminObj as any).password;
  delete (adminObj as any).refreshToken;
  delete (adminObj as any).passwordResetToken;
  delete (adminObj as any).passwordResetExpires;

  return { admin: adminObj as IAdmin, tokens };
};

const logout = async (
  adminId: string,
  refreshToken?: string,
  allDevices: boolean = false
): Promise<void> => {
  const admin = await Admin.findById(adminId).select("+refreshToken");
  if (!admin) {
    throw AuthenticationError.tokenInvalid();
  }

  if (allDevices) {
    admin.refreshToken = null;
  } else if (refreshToken && admin.refreshToken === refreshToken) {
    admin.refreshToken = null;
  }

  await admin.save({ validateBeforeSave: false });
};

const forgotPassword = async (email: string): Promise<void> => {
  const admin = await Admin.findOne({ email, isActive: true });
  if (!admin) {
    return;
  }

  const { token, hashedToken } = generateResetToken();

  admin.passwordResetToken = hashedToken;
  admin.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await admin.save({ validateBeforeSave: false });

  // In production, send email here with the reset token
  console.log(`Password reset token for ${email}: ${token}`);
  console.log(`Reset URL: ${config.urls.frontend}/admin/reset-password?token=${token}`);
};

const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const admin = await Admin.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!admin) {
    throw AppError.badRequest("Invalid or expired reset token", "INVALID_RESET_TOKEN");
  }

  admin.password = newPassword;
  admin.passwordResetToken = null;
  admin.passwordResetExpires = null;
  admin.passwordChangedAt = new Date();
  admin.refreshToken = null;
  admin.loginAttempts = 0;
  admin.lockUntil = null;
  await admin.save();
};

const getCurrentAdmin = async (adminId: string): Promise<IAdmin> => {
  const admin = await Admin.findById(adminId)
    .select("-password -refreshToken -passwordResetToken -passwordResetExpires -__v")
    .populate("createdBy", "fullName email");

  if (!admin) {
    throw AuthenticationError.tokenInvalid();
  }

  if (!admin.isActive) {
    throw AuthenticationError.accountDisabled();
  }

  return admin;
};

const generateTokenPair = (admin: IAdmin): TokenPair => {
  const accessToken = admin.generateAuthToken();
  const refreshToken = admin.generateRefreshToken();

  let expiresIn = 7 * 24 * 60 * 60;
  const jwtExpiresIn = config.jwt.expiresIn;
  if (typeof jwtExpiresIn === "string") {
    const match = jwtExpiresIn.match(/^(\d+)([dhms])$/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      switch (unit) {
        case "d":
          expiresIn = value * 24 * 60 * 60;
          break;
        case "h":
          expiresIn = value * 60 * 60;
          break;
        case "m":
          expiresIn = value * 60;
          break;
        case "s":
          expiresIn = value;
          break;
      }
    }
  }

  return { accessToken, refreshToken, expiresIn };
};

export {
  login,
  refreshTokens,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentAdmin,
  generateTokenPair,
};

export default {
  login,
  refreshTokens,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentAdmin,
  generateTokenPair,
};
kk