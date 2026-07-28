export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode: string;
  public readonly timestamp: Date;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = "INTERNAL_ERROR",
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.timestamp = new Date();
    this.name = this.constructor.name;

    // Capture stack trace excluding constructor call
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.errorCode,
        message: this.message,
        statusCode: this.statusCode,
      },
      timestamp: this.timestamp.toISOString(),
    };
  }

  static badRequest(message: string = "Bad request", errorCode: string = "BAD_REQUEST"): AppError {
    return new AppError(message, 400, errorCode);
  }

  static unauthorized(
    message: string = "Unauthorized",
    errorCode: string = "UNAUTHORIZED"
  ): AppError {
    return new AppError(message, 401, errorCode);
  }

  static forbidden(message: string = "Forbidden", errorCode: string = "FORBIDDEN"): AppError {
    return new AppError(message, 403, errorCode);
  }

  static notFound(
    message: string = "Resource not found",
    errorCode: string = "NOT_FOUND"
  ): AppError {
    return new AppError(message, 404, errorCode);
  }

  static conflict(message: string = "Conflict", errorCode: string = "CONFLICT"): AppError {
    return new AppError(message, 409, errorCode);
  }

  static validationError(
    message: string = "Validation error",
    errorCode: string = "VALIDATION_ERROR"
  ): AppError {
    return new AppError(message, 422, errorCode);
  }

  static tooMany(
    message: string = "Too many requests",
    errorCode: string = "RATE_LIMIT"
  ): AppError {
    return new AppError(message, 429, errorCode);
  }

  static internal(
    message: string = "Internal server error",
    errorCode: string = "INTERNAL_ERROR"
  ): AppError {
    return new AppError(message, 500, errorCode, false);
  }

  static serviceUnavailable(
    message: string = "Service unavailable",
    errorCode: string = "SERVICE_UNAVAILABLE"
  ): AppError {
    return new AppError(message, 503, errorCode);
  }
}

export default AppError;
