import { Request, Response, NextFunction } from "express";
import { AppError } from "../../errors/AppError";

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequestTime: number;
  totalRequests: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
  messageAmharic: string;
}

const store: Map<string, RateLimitEntry> = new Map();

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 60 * 1000,
  maxRequests: 20,
  message:
    "AI request limit reached. You have exceeded 20 requests per hour. Please try again later.",
  messageAmharic: "የAI ጥያቄ ገደብ ላይ ደርሰዋል። በሰዓት ከ20 በላይ ጥያቄዎችን አልፈዋል። እባክዎ ቆይተው እንደገና ይሞክሩ።",
};

const cleanupStore = (): void => {
  const now = Date.now();
  let cleanedCount = 0;
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime <= now) {
      store.delete(key);
      cleanedCount++;
    }
  }
  if (cleanedCount > 0 && process.env.NODE_ENV === "development") {
    console.log(`AI Rate Limiter: Cleaned up ${cleanedCount} expired entries`);
  }
};

// Clean up every 5 minutes
const cleanupInterval = setInterval(cleanupStore, 5 * 60 * 1000);
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

const getClientIdentifier = (req: Request): string => {
  const forwardedFor = req.headers["x-forwarded-for"] as string;
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const userId = (req as any).user?.id;
  if (userId) {
    return `user_${userId}`;
  }

  return req.ip || req.socket.remoteAddress || "unknown_client";
};

const detectLanguage = (req: Request): "en" | "am" => {
  const acceptLang = req.headers["accept-language"] || "";
  if (acceptLang.includes("am")) return "am";
  const queryLang = req.query.lang as string;
  if (queryLang === "am") return "am";
  return "en";
};

const createAiRateLimiter = (config?: Partial<RateLimitConfig>) => {
  const effectiveConfig = { ...defaultConfig, ...config };

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientKey = getClientIdentifier(req);
    const now = Date.now();
    const existing = store.get(clientKey);

    // First request or window expired
    if (!existing || existing.resetTime <= now) {
      store.set(clientKey, {
        count: 1,
        resetTime: now + effectiveConfig.windowMs,
        firstRequestTime: now,
        totalRequests: 1,
      });

      res.setHeader("X-AI-RateLimit-Limit", effectiveConfig.maxRequests);
      res.setHeader("X-AI-RateLimit-Remaining", effectiveConfig.maxRequests - 1);
      res.setHeader("X-AI-RateLimit-Reset", Math.ceil((now + effectiveConfig.windowMs) / 1000));
      next();
      return;
    }

    // Increment count
    existing.count += 1;
    existing.totalRequests += 1;

    const remaining = Math.max(0, effectiveConfig.maxRequests - existing.count);

    res.setHeader("X-AI-RateLimit-Limit", effectiveConfig.maxRequests);
    res.setHeader("X-AI-RateLimit-Remaining", remaining);
    res.setHeader("X-AI-RateLimit-Reset", Math.ceil(existing.resetTime / 1000));

    // Check if over limit
    if (existing.count > effectiveConfig.maxRequests) {
      const retryAfterSeconds = Math.ceil((existing.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);

      // Add warning headers when approaching limit
      const usagePercent = Math.round((existing.count / effectiveConfig.maxRequests) * 100);
      res.setHeader("X-AI-RateLimit-Usage-Percent", usagePercent);

      const lang = detectLanguage(req);
      const errorMessage = lang === "am" ? effectiveConfig.messageAmharic : effectiveConfig.message;

      // Log rate limit violation for monitoring
      console.warn(
        `AI Rate Limit exceeded for client: ${clientKey.substring(0, 20)}... - ${existing.count}/${effectiveConfig.maxRequests} requests`
      );

      next(AppError.tooMany(errorMessage, "AI_RATE_LIMIT_EXCEEDED"));
      return;
    }

    // Warn when approaching limit (80%+)
    const usagePercent = Math.round((existing.count / effectiveConfig.maxRequests) * 100);
    if (usagePercent >= 80) {
      res.setHeader("X-AI-RateLimit-Warning", "Approaching rate limit");
      res.setHeader("X-AI-RateLimit-Usage-Percent", usagePercent);
    }

    next();
  };
};

const getRateLimitStats = (): {
  totalClients: number;
  totalRequests: number;
  limitedClients: number;
} => {
  const now = Date.now();
  let totalRequests = 0;
  let limitedClients = 0;

  for (const entry of store.values()) {
    totalRequests += entry.totalRequests;
    if (entry.count > defaultConfig.maxRequests) {
      limitedClients++;
    }
  }

  return {
    totalClients: store.size,
    totalRequests,
    limitedClients,
  };
};

const resetClientLimit = (clientKey: string): boolean => {
  return store.delete(clientKey);
};

const resetAllLimits = (): void => {
  const count = store.size;
  store.clear();
  console.log(`AI Rate Limiter: Reset all ${count} client limits`);
};

const aiRateLimiter = createAiRateLimiter();

const strictAiRateLimiter = createAiRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 10,
  message: "Strict AI request limit reached. Maximum 10 requests per hour for this endpoint.",
  messageAmharic: "ጥብቅ የAI ጥያቄ ገደብ ላይ ደርሰዋል። ለዚህ አገልግሎት በሰዓት ከፍተኛው 10 ጥያቄዎች ብቻ ነው።",
});

export {
  aiRateLimiter,
  strictAiRateLimiter,
  createAiRateLimiter,
  getRateLimitStats,
  resetClientLimit,
  resetAllLimits,
};

export type { RateLimitConfig, RateLimitEntry };

export default aiRateLimiter;
