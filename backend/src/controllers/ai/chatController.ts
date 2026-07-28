import { Request, Response } from "express";
import * as chatService from "../../services/ai/chatService";
import { asyncHandler } from "../../middleware/asyncHandler";
import { sendSuccess } from "../../utils/responseFormatter";

const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, message, language } = req.body;
  const citizenId = req.user?.id || req.ip || "anonymous";
  const actualSessionId = sessionId || `session_${citizenId}_${Date.now()}`;
  const response = await chatService.sendMessage(actualSessionId, message, language);
  sendSuccess(res, { sessionId: actualSessionId, ...response }, "Message processed successfully");
});

const getSessionHistory = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId;
  const history = chatService.getSessionHistory(sessionId);
  sendSuccess(
    res,
    { sessionId, messages: history, messageCount: history.length },
    "Session history retrieved"
  );
});

const clearSession = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId;
  chatService.clearSession(sessionId);
  sendSuccess(res, null, "Session cleared successfully");
});

const getRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const { query, language } = req.body;
  const recommendations = await chatService.getDetailedRecommendations(query, language || "en");
  sendSuccess(res, { recommendations, count: recommendations.length }, "Recommendations retrieved");
});

const detectLanguage = asyncHandler(async (req: Request, res: Response) => {
  const { text } = req.body;
  const language = chatService.detectLanguage(text);
  sendSuccess(res, { text, language }, "Language detected");
});

export { sendMessage, getSessionHistory, clearSession, getRecommendations, detectLanguage };

export default {
  sendMessage,
  getSessionHistory,
  clearSession,
  getRecommendations,
  detectLanguage,
};
