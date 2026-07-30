import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../../config/index";
import { AuthenticationError } from "../../errors/AuthenticationError";

export const aiAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("Missing or invalid AI token", "token_missing");
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      fullName: decoded.fullName,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError("AI token expired", "token_expired"));
    } else {
      next(error);
    }
  }
};
