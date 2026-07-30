import { AppError } from "./AppError";

export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(message = "Too many requests, please try again later.", retryAfter = 60) {
    super(message, 429, "RATE_LIMIT_ERROR");
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}
