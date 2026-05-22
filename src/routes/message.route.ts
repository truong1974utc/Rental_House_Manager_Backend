import { Router } from "express";
import { MessageController } from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireChatAccess } from "../middlewares/chatAccess.middleware.js";

const router = Router();

router.get("/", authMiddleware, requireChatAccess, MessageController.getMessages);

export default router;
