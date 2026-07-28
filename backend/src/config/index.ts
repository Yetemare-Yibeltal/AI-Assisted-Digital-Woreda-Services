import dotenv from "dotenv";
import path from "path";

// Load .env file from backend root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface AppConfig {
  server: {
    nodeEnv: string;
    port: number;
    host: string;
    isDevelopment: boolean;
    isProduction: boolean;
  };
  database: {
    uri: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  urls: {
    frontend: string;
    backend: string;
  };
  ai: {
    geminiApiKey: string;
  };
  admin: {
    email: string;
    password: string;
    fullName: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    aiMaxRequests: number;
  };
  logging: {
    level: string;
    file: string;
  };
  upload: {
    maxFileSize: number;
    dir: string;
    allowedTypes: string[];
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };
}

// Validate required environment variables
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "FRONTEND_URL"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const config: AppConfig = {
  server: {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "5000", 10),
    host: process.env.HOST || "localhost",
    isDevelopment: (process.env.NODE_ENV || "development") === "development",
    isProduction: process.env.NODE_ENV === "production",
  },
  database: {
    uri: process.env.MONGODB_URI!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
  urls: {
    frontend: process.env.FRONTEND_URL || "http://localhost:5173",
    backend: process.env.BACKEND_URL || "http://localhost:5000",
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || "",
  },
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@dangila.gov.et",
    password: process.env.ADMIN_PASSWORD || "Admin@123456",
    fullName: process.env.ADMIN_FULL_NAME || "Woreda Administrator",
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
    aiMaxRequests: parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS || "20", 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || "debug",
    file: process.env.LOG_FILE || "logs/app.log",
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880", 10),
    dir: process.env.UPLOAD_DIR || "uploads",
    allowedTypes: (
      process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp,application/pdf"
    ).split(","),
  },
  email: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.EMAIL_FROM || "noreply@dangila.gov.et",
  },
};

export default config;
export type { AppConfig };
