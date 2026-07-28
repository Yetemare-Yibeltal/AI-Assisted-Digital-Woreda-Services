import { AppError } from './AppError';export class RateLimitError extends AppError { constructor(message: string = 'Too many requests') { super(message, 429, 'RATE_LIMIT_ERROR'); } }
