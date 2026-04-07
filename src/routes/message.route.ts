import { Router } from "express";
import { MessageController } from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, MessageController.getMessages);

export default router;