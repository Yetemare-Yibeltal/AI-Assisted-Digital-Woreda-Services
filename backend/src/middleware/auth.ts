import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import config from "../config/index";
import { AuthenticationError } from "../errors/AuthenticationError";
import { AppError } from "../errors/AppError";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  fullName: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        fullName: string;
      };
    }
  }
}

const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Check query parameter (for PDF downloads etc.)
    if (!token && req.query.token) {
      token = req.query.token as string;
    }

    // Check cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw AuthenticationError.tokenMissing();
    }

    // Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw AuthenticationError.tokenExpired();
      }
      throw AuthenticationError.tokenInvalid();
    }

    // Check if user still exists
    const admin = await Admin.findById(decoded.id).select("-password -refreshToken");
    if (!admin) {
      throw AuthenticationError.tokenInvalid();
    }

    // Check if user is active
    if (!admin.isActive) {
      throw AuthenticationError.accountDisabled();
    }

    // Check if account is locked
    if (admin.isLocked) {
      throw AuthenticationError.accountLocked(admin.lockUntil || undefined);
    }

    // Check if password changed after token was issued
    if (admin.passwordChangedAt && decoded.iat) {
      const passwordChangedTimestamp = Math.floor(admin.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < passwordChangedTimestamp) {
        throw AuthenticationError.tokenExpired();
      }
    }

    // Attach user to request
    req.user = {
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      fullName: admin.fullName,
    };

    next();
  } catch (error) {
    if (error instanceof AppError || error instanceof AuthenticationError) {
      next(error);
    } else {
      next(AuthenticationError.tokenInvalid());
    }
  }
};

const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        const admin = await Admin.findById(decoded.id).select("-password -refreshToken");
        if (admin && admin.isActive && !admin.isLocked) {
          req.user = {
            id: admin._id.toString(),
            email: admin.email,
            role: admin.role,
            fullName: admin.fullName,
          };
        }
      } catch {
        // Token invalid — continue without user
      }
    }
    next();
  } catch {
    next();
  }
};

export { authenticate, optionalAuth };
export default authenticate;
