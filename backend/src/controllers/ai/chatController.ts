import { Request, Response } from "express";
import * as chatService from "../../services/ai/chatService";
import * as recommendationService from "../../services/ai/recommendationService";
import * as translationService from "../../services/ai/translationService";
import { asyncHandler } from "../../middleware/asyncHandler";
import { sendSuccess, sendError } from "../../utils/responseFormatter";
import { aiConfig, isAIConfigured } from "../../config/ai/index";

const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  if (!isAIConfigured()) {
    sendError(res, "AI services are not configured. Please contact the administrator.", 503);
    return;
  }

  const { sessionId, message, language } = req.body;

  if (!message || message.trim().length === 0) {
    sendError(res, "Message is required", 400);
    return;
  }

  if (message.length > 2000) {
    sendError(res, "Message is too long. Please limit to 2000 characters.", 400);
    return;
  }

  const citizenId = req.user?.id || req.ip || `citizen_${Date.now()}`;
  const actualSessionId = sessionId || `session_${citizenId}`;

  try {
    const detectedLang = language || chatService.detectLanguage(message);
    const response = await chatService.sendMessage(actualSessionId, message, detectedLang);

    if (response.recommendations && response.recommendations.length > 0) {
      const translatedRecs = await Promise.all(
        response.recommendations.map(async (rec) => {
          if (detectedLang === "am" && rec.reasoning) {
            rec.reasoningAmharic =
              rec.reasoningAmharic ||
              (await translationService.translateLocally(rec.reasoning, "en", "am"));
          }
          if (detectedLang === "en" && rec.reasoningAmharic) {
            rec.reasoning =
              rec.reasoning ||
              (await translationService.translateLocally(rec.reasoningAmharic, "am", "en"));
          }
          return rec;
        })
      );
      response.recommendations = translatedRecs;
    }

    sendSuccess(
      res,
      {
        sessionId: actualSessionId,
        message: response.message,
        language: response.language,
        recommendations: response.recommendations,
        suggestedQuestions: response.suggestedQuestions,
        confidence: response.confidence,
        timestamp: new Date().toISOString(),
      },
      "Message processed successfully"
    );
  } catch (error) {
    console.error("Chat error:", error);
    const fallbackMsg =
      language === "am"
        ? aiConfig.fallback.defaultResponseAmharic
        : aiConfig.fallback.defaultResponse;
    sendSuccess(
      res,
      {
        sessionId: actualSessionId,
        message: fallbackMsg,
        language: language || "en",
        confidence: 0,
        timestamp: new Date().toISOString(),
      },
      "Fallback response sent"
    );
  }
});

const getSessionHistory = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    sendError(res, "Session ID is required", 400);
    return;
  }

  const history = chatService.getSessionHistory(sessionId);

  sendSuccess(
    res,
    {
      sessionId,
      messages: history,
      messageCount: history.length,
      hasActiveSession: history.length > 0,
    },
    "Session history retrieved successfully"
  );
});

const clearSession = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    sendError(res, "Session ID is required", 400);
    return;
  }

  chatService.clearSession(sessionId);
  sendSuccess(res, { sessionId, cleared: true }, "Session cleared successfully");
});

const getQuickRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const { query, language } = req.body;

  if (!query || query.trim().length === 0) {
    sendError(res, "Query is required for recommendations", 400);
    return;
  }

  const detectedLang = language || chatService.detectLanguage(query);
  const recommendations = await chatService.getDetailedRecommendations(query, detectedLang);

  sendSuccess(
    res,
    {
      query,
      language: detectedLang,
      recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString(),
    },
    "Recommendations retrieved successfully"
  );
});

const getSuggestedQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { context, language } = req.body;

  const questions =
    language === "am"
      ? [
          "ምን አገልግሎቶች አሏችሁ?",
          "የልደት ሰርተፍኬት እንዴት ማግኘት እችላለሁ?",
          "ምን ያህል ጊዜ ይወስዳል?",
          "ምን ሰነዶች ያስፈልጋሉ?",
          "ክፍያው ስንት ነው?",
          "ቢሮዎ የት ነው የሚገኘው?",
        ]
      : [
          "What services do you offer?",
          "How do I get a birth certificate?",
          "How long does it take?",
          "What documents do I need?",
          "How much is the fee?",
          "Where is your office located?",
        ];

  sendSuccess(res, { questions, language: language || "en" }, "Suggested questions retrieved");
});

export {
  sendMessage,
  getSessionHistory,
  clearSession,
  getQuickRecommendations,
  getSuggestedQuestions,
};

export default {
  sendMessage,
  getSessionHistory,
  clearSession,
  getQuickRecommendations,
  getSuggestedQuestions,
};
