import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import appConfig from "./config/app";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

const app: Application = express();

// =============================================
// SECURITY MIDDLEWARE
// =============================================

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors(appConfig.cors));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use(limiter);

// =============================================
// BODY PARSING & DATA SANITIZATION
// =============================================

// Parse JSON request body
app.use(express.json({ limit: appConfig.bodyLimit }));

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true, limit: appConfig.bodyLimit }));

// Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// Prevent HTTP parameter pollution
app.use(hpp());

// =============================================
// PERFORMANCE & LOGGING
// =============================================

// Compress responses
app.use(compression());

// HTTP request logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// =============================================
// HEALTH CHECK
// =============================================
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Dangila Digital Woreda Services API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// =============================================
// API ROUTES
// =============================================
app.use(appConfig.apiPrefix, routes);

// =============================================
// 404 HANDLER
// =============================================
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =============================================
// GLOBAL ERROR HANDLER
// =============================================
app.use(errorHandler);

export default app;
