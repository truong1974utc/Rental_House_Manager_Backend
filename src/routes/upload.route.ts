import express, { Router } from "express";
import multer from "multer";
import { UploadController } from "../controllers/upload.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireChatAccess } from "../middlewares/chatAccess.middleware.js";

const router = Router();
const MAX_CHAT_UPLOAD_SIZE = 5 * 1024 * 1024;
const rawChatUpload = express.raw({ type: "*/*", limit: MAX_CHAT_UPLOAD_SIZE });
const multipartChatUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_CHAT_UPLOAD_SIZE
    }
}).single("file");

const parseChatUpload: express.RequestHandler = (req, res, next) => {
    const parser = req.is("multipart/form-data") ? multipartChatUpload : rawChatUpload;

    parser(req, res, (error: unknown) => {
        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ success: false, message: "File tối đa 5MB." });
        }

        if (error) {
            return next(error);
        }

        next();
    });
};

router.post(
    "/chat",
    authMiddleware,
    requireChatAccess,
    parseChatUpload,
    UploadController.uploadChatFile
);

export default router;
