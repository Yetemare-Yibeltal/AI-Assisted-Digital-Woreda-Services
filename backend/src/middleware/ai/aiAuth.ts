import { Request, Response, NextFunction } from 'express';import { authenticate } from '../auth';export const aiAuth = authenticate;
