import { Notification } from "../models/Notification.js";
import { CreateNotificationInput, UpdateNotificationInput } from "../schemas/notification.schema.js";
import { Room } from "../models/Room.js";

export const NotificationService = {
    getNotifications: async (roomId?: string, tenantId?: string) => {
        let query: any = { isGlobal: true };
        
        if (roomId) {
            query = {
                $or: [
                    { isGlobal: true },
                    { roomId: roomId },
                    ...(tenantId ? [{ tenantId }] : [])
                ]
            };
        } else {
            // Admin gets all notifications
            query = {};
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .populate("roomId", "roomNumber")
            .populate("tenantId", "fullName roomId");
        return notifications;
    },

    createNotification: async (data: CreateNotificationInput) => {
        const notification = await Notification.create(data);
        return notification;
    },

    markAsRead: async (id: string, updateData: UpdateNotificationInput) => {
        const notification = await Notification.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        if (!notification) {
            throw new Error("Không tìm thấy thông báo");
        }
        return notification;
    },

    markAllAsRead: async (roomId?: string, tenantId?: string) => {
        let query: any = { isRead: false };
        if (roomId) {
            query = {
                isRead: false,
                $or: [
                    { isGlobal: true },
                    { roomId },
                    ...(tenantId ? [{ tenantId }] : [])
                ]
            };
        }
        await Notification.updateMany(query, { isRead: true });
        return { success: true };
    },

    deleteNotification: async (id: string) => {
        const notification = await Notification.findByIdAndDelete(id);
        if (!notification) {
            throw new Error("Không tìm thấy thông báo");
        }
        return notification;
    }
};
