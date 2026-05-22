import { Request, Response } from "express";
import { randomUUID } from "crypto";
import path from "path";
import { promises as fs } from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "chat");
const ALLOWED_EXTENSIONS = new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".pdf",
    ".txt",
    ".csv",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".zip",
    ".rar"
]);
const ALLOWED_CONTENT_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/octet-stream"
]);

const decodeFileName = (value: string | string[] | undefined) => {
    const rawName = Array.isArray(value) ? value[0] : value;
    if (!rawName) return "";
    try {
        return decodeURIComponent(rawName);
    } catch {
        return rawName;
    }
};

const sanitizeOriginalName = (fileName: string) => {
    return path.basename(fileName).replace(/[^\w.\-()[\] ]+/g, "_").slice(0, 160);
};

const getRequestOrigin = (req: Request) => `${req.protocol}://${req.get("host")}`;

export const UploadController = {
    uploadChatFile: asyncHandler(async (req: Request, res: Response) => {
        const fileBuffer = req.body;
        const originalName = sanitizeOriginalName(decodeFileName(req.headers["x-file-name"]));
        const contentType = String(req.headers["content-type"] || "application/octet-stream").split(";")[0].toLowerCase();
        const extension = path.extname(originalName).toLowerCase();

        if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
            return res.status(400).json({ success: false, message: "File không hợp lệ." });
        }

        if (fileBuffer.length > MAX_UPLOAD_SIZE) {
            return res.status(400).json({ success: false, message: "File tối đa 5MB." });
        }

        if (!originalName || !ALLOWED_EXTENSIONS.has(extension)) {
            return res.status(400).json({ success: false, message: "Định dạng file không được hỗ trợ." });
        }

        if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
            return res.status(400).json({ success: false, message: "Loại file không được hỗ trợ." });
        }

        await fs.mkdir(UPLOAD_DIR, { recursive: true });

        const storedName = `${Date.now()}-${randomUUID()}${extension}`;
        const storedPath = path.join(UPLOAD_DIR, storedName);
        await fs.writeFile(storedPath, fileBuffer);

        const url = `${getRequestOrigin(req)}/uploads/chat/${storedName}`;

        res.status(201).json({
            success: true,
            data: {
                url,
                originalName,
                storedName,
                contentType,
                size: fileBuffer.length
            }
        });
    })
};
