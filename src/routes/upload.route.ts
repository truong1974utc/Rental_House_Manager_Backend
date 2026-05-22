import express, { Router } from "express";
import { UploadController } from "../controllers/upload.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireChatAccess } from "../middlewares/chatAccess.middleware.js";

const router = Router();

router.post(
    "/chat",
    authMiddleware,
    requireChatAccess,
    express.raw({ type: "*/*", limit: "5mb" }),
    UploadController.uploadChatFile
);

export default router;
