import { Request, Response, NextFunction } from "express";
import Admin from "../models/Admin";
import { AuthorizationError } from "../errors/AuthorizationError";
import { IAdminPermissions } from "../models/Admin";

type AdminRole = "super_admin" | "admin" | "officer" | "viewer";

const authorize = (...allowedRoles: AdminRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AuthorizationError.insufficientRole("authenticated", "anonymous"));
      return;
    }

    if (allowedRoles.length === 0) {
      next();
      return;
    }

    if (allowedRoles.includes(req.user.role as AdminRole)) {
      next();
    } else {
      next(AuthorizationError.insufficientRole(allowedRoles.join(" or "), req.user.role));
    }
  };
};

const requirePermission = (permission: keyof IAdminPermissions) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        next(AuthorizationError.insufficientRole("authenticated", "anonymous"));
        return;
      }

      const admin = await Admin.findById(req.user.id).select("+permissions");
      if (!admin) {
        next(AuthorizationError.insufficientRole("admin", "unknown"));
        return;
      }

      if (admin.hasPermission(permission)) {
        next();
      } else {
        next(AuthorizationError.insufficientPermission(permission));
      }
    } catch (error) {
      next(error);
    }
  };
};

const adminOnly = authorize("super_admin", "admin");
const superAdminOnly = authorize("super_admin");
const officerAndAbove = authorize("super_admin", "admin", "officer");
const allRoles = authorize("super_admin", "admin", "officer", "viewer");

export { authorize, requirePermission, adminOnly, superAdminOnly, officerAndAbove, allRoles };

export default authorize;
