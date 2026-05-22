import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/unauthorized.error.js";
import { CHAT_ACCESS_DENIED_MESSAGE, hasChatAccess } from "../utils/chatAccess.js";

export const requireChatAccess = (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenant) {
        return next(new UnauthorizedError("Unauthorized"));
    }

    if (!hasChatAccess(req.tenant)) {
        return res.status(403).json({
            success: false,
            message: CHAT_ACCESS_DENIED_MESSAGE
        });
    }

    next();
};
