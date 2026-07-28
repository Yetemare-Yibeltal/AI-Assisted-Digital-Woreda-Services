import { Router } from "express";
import {
  sendMessage,
  getSessionHistory,
  clearSession,
} from "../../../controllers/ai/chatController";
import { aiRateLimiter } from "../../../middleware/ai/aiRateLimiter";

const router = Router();

router.use(aiRateLimiter);

router.post("/message", sendMessage);
router.get("/session/:sessionId", getSessionHistory);
router.delete("/session/:sessionId", clearSession);

export default router;
