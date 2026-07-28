import { Router, Request, Response } from "express";
import chatRoutes from "./chat";
import recommendationRoutes from "./recommendations";
import { getRateLimitStats } from "../../../middleware/ai/aiRateLimiter";
import { isAIConfigured } from "../../../config/ai/index";

const router = Router();

// AI status check
router.get("/status", (_req: Request, res: Response) => {
  const configured = isAIConfigured();
  const stats = getRateLimitStats();

  res.json({
    success: true,
    data: {
      available: configured,
      provider: configured ? "Google Gemini" : "None",
      model: configured ? "gemini-1.5-flash" : "N/A",
      features: {
        chat: configured,
        recommendations: configured,
        translation: configured,
      },
      rateLimit: {
        totalClients: stats.totalClients,
        totalRequests: stats.totalRequests,
        limitedClients: stats.limitedClients,
      },
      supportedLanguages: ["en", "am"],
      status: configured ? "operational" : "unavailable",
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount sub-routes
router.use("/chat", chatRoutes);
router.use("/recommendations", recommendationRoutes);

// 404 for unknown AI endpoints
router.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "AI endpoint not found",
    availableEndpoints: [
      "GET  /api/v1/ai/status",
      "POST /api/v1/ai/chat/message",
      "GET  /api/v1/ai/chat/session/:sessionId",
      "DELETE /api/v1/ai/chat/session/:sessionId",
      "POST /api/v1/ai/recommendations",
      "GET  /api/v1/ai/recommendations/category/:category",
    ],
  });
});

export default router;
