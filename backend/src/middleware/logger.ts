import { Request, Response, NextFunction } from "express";

const getStatusColor = (statusCode: number): string => {
  if (statusCode >= 500) return "\x1b[31m"; // Red
  if (statusCode >= 400) return "\x1b[33m"; // Yellow
  if (statusCode >= 300) return "\x1b[36m"; // Cyan
  if (statusCode >= 200) return "\x1b[32m"; // Green
  return "\x1b[0m"; // Reset
};

const resetColor = "\x1b[0m";

const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  if (req.path === "/health") {
    return next();
  }

  const startTime = Date.now();
  const { method, originalUrl } = req;
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  const userAgent = (req.headers["user-agent"] as string)?.substring(0, 80) || "unknown";

  const userId = (req as any).user?.id || "anonymous";
  const userRole = (req as any).user?.role || "-";

  res.on("finish", () => {
    const responseTime = Date.now() - startTime;
    const { statusCode } = res;
    const color = getStatusColor(statusCode);
    const responseTimeDisplay =
      responseTime < 1000 ? `${responseTime}ms` : `${(responseTime / 1000).toFixed(2)}s`;

    const logMessage = [
      `[${new Date().toISOString()}]`,
      `${color}${method}${resetColor}`,
      originalUrl,
      `${color}${statusCode}${resetColor}`,
      responseTimeDisplay,
      `- ${clientIp}`,
      `| ${userId}(${userRole})`,
      `| ${userAgent.substring(0, 50)}`,
    ].join(" ");

    if (statusCode >= 400) {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  });

  next();
};

export { requestLogger };
export default requestLogger;
