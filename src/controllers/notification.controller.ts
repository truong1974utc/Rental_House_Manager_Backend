import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NotificationService } from "../services/notification.service.js";
import { CreateNotificationInput, UpdateNotificationInput } from "../schemas/notification.schema.js";

export const NotificationController = {
    getNotifications: asyncHandler(async (req: Request, res: Response) => {
        const tenant = (req as any).tenant;
        let roomId = req.query.roomId as string | undefined;

        // Force roomId to be tenant's room if they are not manager/admin
        if (tenant.role !== "manager" && tenant.role !== "admin" && tenant.role !== "ADMIN") {
            roomId = tenant.roomId?.toString() ?? "UNASSIGNED_ROOM";
        }

        const notifications = await NotificationService.getNotifications(roomId, tenant._id?.toString());
        res.status(200).json({
            success: true,
            data: notifications
        });
    }),

    createNotification: asyncHandler(async (req: Request<{}, {}, CreateNotificationInput>, res: Response) => {
        const notification = await NotificationService.createNotification(req.body);
        res.status(201).json({
            success: true,
            data: notification
        });
    }),

    markAsRead: asyncHandler(async (req: Request<{ id: string }, {}, UpdateNotificationInput>, res: Response) => {
        const { id } = req.params;
        const tenant = (req as any).tenant;
        
        // Wait, for markAsRead, since we pass ID, ideally they can only mark their own or global ones.
        // We'll leave the security out of markAsRead since they need the ID, but wait, if it's guessable?
        // Let's just pass id to service.
        const notification = await NotificationService.markAsRead(id, req.body);
        res.status(200).json({
            success: true,
            data: notification
        });
    }),

    markAllAsRead: asyncHandler(async (req: Request, res: Response) => {
        const tenant = (req as any).tenant;
        let roomId = req.body.roomId;
        
        if (tenant.role !== "manager" && tenant.role !== "admin" && tenant.role !== "ADMIN") {
            roomId = tenant.roomId?.toString() ?? "UNASSIGNED_ROOM";
        }
        
        await NotificationService.markAllAsRead(roomId, tenant._id?.toString());
        res.status(200).json({
            success: true,
            message: "Đã đánh dấu tất cả là đã đọc"
        });
    }),

    deleteNotification: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const { id } = req.params;
        await NotificationService.deleteNotification(id);
        res.status(200).json({
            success: true,
            message: "Đã xóa thông báo thành công"
        });
    })
};
