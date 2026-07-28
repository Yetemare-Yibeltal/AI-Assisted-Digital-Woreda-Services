import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/AppError";

interface AIRateLimitEntry {
  count: number;
  resetTime: number;
}

const store: Map<string, AIRateLimitEntry> = new Map();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 20;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime <= now) {
      store.delete(key);
    }
  }
}, 300000);

const aiRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const clientKey = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = store.get(clientKey);

  if (!entry || entry.resetTime <= now) {
    store.set(clientKey, { count: 1, resetTime: now + WINDOW_MS });
    res.setHeader("X-AI-RateLimit-Limit", MAX_REQUESTS);
    res.setHeader("X-AI-RateLimit-Remaining", MAX_REQUESTS - 1);
    next();
    return;
  }

  entry.count++;
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  res.setHeader("X-AI-RateLimit-Limit", MAX_REQUESTS);
  res.setHeader("X-AI-RateLimit-Remaining", remaining);

  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    res.setHeader("Retry-After", retryAfter);
    next(AppError.tooMany("AI request limit reached. Please try again later.", "AI_RATE_LIMIT"));
    return;
  }

  next();
};

export { aiRateLimiter };
export default aiRateLimiter;
