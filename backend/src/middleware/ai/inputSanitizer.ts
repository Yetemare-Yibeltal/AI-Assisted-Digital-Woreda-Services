import { Request, Response, NextFunction } from "express";

export const inputSanitizer = (req: Request, res: Response, next: NextFunction) => {
  if (req.body?.message) {
    req.body.message = req.body.message.trim().substring(0, 2000);
  }
  if (req.body?.query) {
    req.body.query = req.body.query.trim().substring(0, 1000);
  }
  if (req.body?.text) {
    req.body.text = req.body.text.trim().substring(0, 5000);
  }
  next();
};
