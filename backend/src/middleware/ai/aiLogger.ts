import { Request, Response, NextFunction } from 'express';export const aiLogger = (req: Request, res: Response, next: NextFunction) => { console.log('[AI] ' + req.method + ' ' + req.path); next(); };
