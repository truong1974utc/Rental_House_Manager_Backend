import { Request, Response } from "express";
import { Message } from "../models/Message.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const MessageController = {
    getMessages: asyncHandler(async (req: Request, res: Response) => {
        const messages = await Message.find()
            .populate({
                path: 'sender',
                select: 'fullName username role',
                populate: { path: 'roomId', select: 'roomNumber' }
            })
            .sort({ createdAt: 1 })
            .limit(100);
            
        res.status(200).json({
            success: true,
            data: messages
        });
    })
};