import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

const createRateLimiter = (
  windowMs: number,
  maxRequests: number,
  message: string = "Too many requests. Please try again later."
) => {
  const store: RateLimitStore = {};

  // Clean up expired entries every minute
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime <= now) {
        delete store[key];
      }
    });
  }, 60000);

  // Allow cleanup to be garbage collected if server stops
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientKey =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      "unknown";

    const requestKey = `${clientKey}:${req.path}`;
    const now = Date.now();

    if (!store[requestKey]) {
      store[requestKey] = {
        count: 1,
        resetTime: now + windowMs,
      };
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", maxRequests - 1);
      res.setHeader("X-RateLimit-Reset", Math.ceil(store[requestKey].resetTime / 1000));
      next();
      return;
    }

    const entry = store[requestKey];

    // Reset if window has passed
    if (entry.resetTime <= now) {
      entry.count = 1;
      entry.resetTime = now + windowMs;
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", maxRequests - 1);
      res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetTime / 1000));
      next();
      return;
    }

    // Increment count
    entry.count += 1;
    const remaining = Math.max(0, maxRequests - entry.count);
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetTime / 1000));

    if (entry.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      next(AppError.tooMany(message, "RATE_LIMIT_EXCEEDED"));
      return;
    }

    next();
  };
};

const generalLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  "Too many requests from this IP. Please try again in 15 minutes."
);

const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  "Too many login attempts. Please try again in 15 minutes."
);

const aiLimiter = createRateLimiter(
  60 * 60 * 1000,
  20,
  "AI request limit reached. Please try again in 1 hour."
);

const applicationSubmitLimiter = createRateLimiter(
  60 * 60 * 1000,
  5,
  "You can only submit 5 applications per hour. Please try again later."
);

export { createRateLimiter, generalLimiter, authLimiter, aiLimiter, applicationSubmitLimiter };

export default generalLimiter;
