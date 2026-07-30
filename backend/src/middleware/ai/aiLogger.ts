import { Request, Response, NextFunction } from "express";

export const aiLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  console.log(`[AI] ${req.method} ${req.originalUrl} - Started`);
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[AI] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
};
