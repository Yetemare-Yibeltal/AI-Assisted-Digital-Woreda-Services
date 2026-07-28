import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { NotFoundError } from "../errors/NotFoundError";
import { ValidationError } from "../errors/ValidationError";
import { AuthenticationError } from "../errors/AuthenticationError";
import { AuthorizationError } from "../errors/AuthorizationError";
import mongoose from "mongoose";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

interface ErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: unknown;
    stack?: string;
  };
  timestamp: string;
}

const sendErrorDev = (err: AppError, res: Response): void => {
  const response: ErrorResponse = {
    success: false,
    error: {
      code: err.errorCode || "INTERNAL_ERROR",
      message: err.message,
      statusCode: err.statusCode || 500,
      details: (err as any).errors || undefined,
      stack: err.stack,
    },
    timestamp: new Date().toISOString(),
  };
  res.status(err.statusCode || 500).json(response);
};

const sendErrorProd = (err: AppError, res: Response): void => {
  if (err.isOperational) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        statusCode: err.statusCode,
        details: (err as any).errors || undefined,
      },
      timestamp: new Date().toISOString(),
    };
    res.status(err.statusCode).json(response);
  } else {
    console.error("ERROR 💥:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again later.",
        statusCode: 500,
      },
      timestamp: new Date().toISOString(),
    });
  }
};

const handleCastErrorDB = (err: mongoose.Error.CastError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}. Please provide a valid value.`;
  return AppError.badRequest(message, "INVALID_ID_FORMAT");
};

const handleDuplicateFieldsDB = (err: any): AppError => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate value for field '${field}': '${value}'. Please use another value.`;
  return AppError.conflict(message, "DUPLICATE_FIELD");
};

const handleValidationErrorDB = (err: mongoose.Error.ValidationError): ValidationError => {
  return ValidationError.fromMongooseError(err);
};

const handleJWTError = (): AuthenticationError => {
  return AuthenticationError.tokenInvalid();
};

const handleJWTExpiredError = (): AuthenticationError => {
  return AuthenticationError.tokenExpired();
};

const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  let error: AppError;

  // Handle known AppError types
  if (
    err instanceof AppError ||
    err instanceof NotFoundError ||
    err instanceof ValidationError ||
    err instanceof AuthenticationError ||
    err instanceof AuthorizationError
  ) {
    error = err as AppError;
  }
  // Handle Mongoose bad ObjectId
  else if (err instanceof mongoose.Error.CastError) {
    error = handleCastErrorDB(err);
  }
  // Handle Mongoose duplicate key
  else if ((err as any).code === 11000) {
    error = handleDuplicateFieldsDB(err);
  }
  // Handle Mongoose validation error
  else if (err instanceof mongoose.Error.ValidationError) {
    error = handleValidationErrorDB(err);
  }
  // Handle JWT errors
  else if (err instanceof JsonWebTokenError) {
    error = handleJWTError();
  } else if (err instanceof TokenExpiredError) {
    error = handleJWTExpiredError();
  }
  // Handle multer file size error
  else if ((err as any).code === "LIMIT_FILE_SIZE") {
    error = AppError.badRequest("File size exceeds the maximum allowed limit.", "FILE_TOO_LARGE");
  }
  // Handle multer file type error
  else if ((err as any).code === "LIMIT_UNEXPECTED_FILE") {
    error = AppError.badRequest(
      "Unexpected file field. Please check the upload field name.",
      "INVALID_FILE_FIELD"
    );
  }
  // Handle syntax error in JSON parsing
  else if (err instanceof SyntaxError && "body" in err) {
    error = AppError.badRequest(
      "Invalid JSON in request body. Please check your syntax.",
      "INVALID_JSON"
    );
  }
  // Unknown error — create generic AppError
  else {
    const statusCode = (err as any).statusCode || 500;
    const message = (err as any).statusCode ? err.message : "Internal server error";
    error = new AppError(message, statusCode, "INTERNAL_ERROR", !!(err as any).statusCode);
  }

  // Log error
  if (error.statusCode >= 500) {
    console.error("ERROR 💥:", {
      message: error.message,
      stack: error.stack,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }

  // Send response based on environment
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

export { errorHandler };
export default errorHandler;
