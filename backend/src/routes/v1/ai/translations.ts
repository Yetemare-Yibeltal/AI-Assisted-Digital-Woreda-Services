import { Router } from "express";
import { translateText } from "../../../controllers/ai/translationController";
import { aiRateLimiter } from "../../../middleware/ai/aiRateLimiter";
import { inputSanitizer } from "../../../middleware/ai/inputSanitizer";

const router = Router();

router.post("/", aiRateLimiter, inputSanitizer, translateText);

export default router;
