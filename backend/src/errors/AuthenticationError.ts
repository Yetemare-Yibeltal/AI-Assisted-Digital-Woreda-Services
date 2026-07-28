import { AppError } from "./AppError";

export type AuthFailureReason =
  | "invalid_credentials"
  | "token_missing"
  | "token_expired"
  | "token_invalid"
  | "account_locked"
  | "account_disabled"
  | "account_unverified"
  | "session_expired"
  | "invalid_refresh_token";

export class AuthenticationError extends AppError {
  public readonly reason: AuthFailureReason;

  constructor(
    message: string = "Authentication failed",
    reason: AuthFailureReason = "invalid_credentials"
  ) {
    super(message, 401, "AUTHENTICATION_ERROR");
    this.reason = reason;
    this.name = "AuthenticationError";
  }

  static invalidCredentials(): AuthenticationError {
    return new AuthenticationError(
      "Invalid email or password. Please check your credentials and try again.",
      "invalid_credentials"
    );
  }

  static tokenMissing(): AuthenticationError {
    return new AuthenticationError(
      "Authentication token is missing. Please login to continue.",
      "token_missing"
    );
  }

  static tokenExpired(): AuthenticationError {
    return new AuthenticationError(
      "Your session has expired. Please login again to continue.",
      "token_expired"
    );
  }

  static tokenInvalid(): AuthenticationError {
    return new AuthenticationError(
      "Authentication token is invalid or has been tampered with.",
      "token_invalid"
    );
  }

  static accountLocked(unlockTime?: Date): AuthenticationError {
    const timeMsg = unlockTime
      ? ` Please try again after ${unlockTime.toLocaleTimeString()}.`
      : " Please try again later.";
    return new AuthenticationError(
      `Your account has been temporarily locked due to multiple failed login attempts.${timeMsg}`,
      "account_locked"
    );
  }

  static accountDisabled(): AuthenticationError {
    return new AuthenticationError(
      "Your account has been disabled. Please contact the system administrator.",
      "account_disabled"
    );
  }

  static accountUnverified(): AuthenticationError {
    return new AuthenticationError(
      "Your account has not been verified yet. Please contact the system administrator.",
      "account_unverified"
    );
  }

  static invalidRefreshToken(): AuthenticationError {
    return new AuthenticationError(
      "Invalid or expired refresh token. Please login again.",
      "invalid_refresh_token"
    );
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.errorCode,
        message: this.message,
        statusCode: this.statusCode,
        reason: this.reason,
      },
      timestamp: this.timestamp.toISOString(),
    };
  }
}

export default AuthenticationError;
