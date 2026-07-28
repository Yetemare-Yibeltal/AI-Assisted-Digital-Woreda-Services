import { Request, Response } from "express";
import * as authService from "../services/authService";
import { asyncHandler } from "../middleware/asyncHandler";
import { sendSuccess } from "../utils/responseFormatter";

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.cookie("refreshToken", result.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(
    res,
    {
      admin: result.admin,
      accessToken: result.tokens.accessToken,
      expiresIn: result.tokens.expiresIn,
    },
    "Login successful"
  );
});

const refreshTokens = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(400).json({
      success: false,
      message: "Refresh token is required",
    });
    return;
  }

  const result = await authService.refreshTokens(refreshToken);

  res.cookie("refreshToken", result.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(
    res,
    {
      admin: result.admin,
      accessToken: result.tokens.accessToken,
      expiresIn: result.tokens.expiresIn,
    },
    "Tokens refreshed successfully"
  );
});

const logout = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.user?.id || "";
  const { refreshToken, allDevices } = req.body;

  await authService.logout(adminId, refreshToken, allDevices);

  res.clearCookie("refreshToken");

  sendSuccess(res, null, "Logout successful");
});

const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  sendSuccess(res, null, "If the email exists, a password reset link has been sent");
});

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  sendSuccess(res, null, "Password reset successful. Please login with your new password.");
});

const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.user?.id || "";
  const admin = await authService.getCurrentAdmin(adminId);
  sendSuccess(res, admin, "Current user retrieved successfully");
});

export { login, refreshTokens, logout, forgotPassword, resetPassword, getCurrentUser };

export default {
  login,
  refreshTokens,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
};
