import { Request, Response, NextFunction } from "express";
import cacheService from "../../services/cacheService";

export const aiCache = (duration: number = 600) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `ai:${req.originalUrl}`;
    const cached = cacheService.get(key);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (body?.success && !body.cached) {
        cacheService.set(key, body.data, duration);
      }
      return originalJson(body);
    };
    next();
  };
};
