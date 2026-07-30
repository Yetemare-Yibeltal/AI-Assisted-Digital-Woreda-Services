import { Router } from "express";
import { processVoice } from "../../../controllers/ai/voiceController";
import { authenticate } from "../../../middleware/auth";
import { aiRateLimiter } from "../../../middleware/ai/aiRateLimiter";

const router = Router();

router.post("/process", authenticate, aiRateLimiter, processVoice);

export default router;
