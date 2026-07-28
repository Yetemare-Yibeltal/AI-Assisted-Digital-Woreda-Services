import { Router } from "express";
import chatRoutes from "./chat";
import recommendationRoutes from "./recommendations";

const router = Router();

router.use("/chat", chatRoutes);
router.use("/recommendations", recommendationRoutes);

export default router;
