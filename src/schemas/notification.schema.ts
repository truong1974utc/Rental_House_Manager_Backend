import { z } from "zod";
import { NOTIFICATION_TYPE } from "../constants/enum.js";
import { Types } from "mongoose";

export const createNotificationSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Tiêu đề không được để trống"),
        message: z.string().min(1, "Nội dung không được để trống"),
        type: z.nativeEnum(NOTIFICATION_TYPE).optional().default(NOTIFICATION_TYPE.GENERAL),
        isGlobal: z.boolean().optional().default(false),
        roomId: z.string().optional().nullable().refine((val) => !val || Types.ObjectId.isValid(val), "RootId không hợp lệ"),
        tenantId: z.string().optional().nullable().refine((val) => !val || Types.ObjectId.isValid(val), "TenantId không hợp lệ"),
    })
});

export const updateNotificationSchema = z.object({
    params: z.object({
        id: z.string().refine((val) => Types.ObjectId.isValid(val), "Id không hợp lệ"),
    }),
    body: z.object({
        isRead: z.boolean().optional(),
    }).strict()
});

export const getNotificationSchema = z.object({
    params: z.object({
        id: z.string().refine((val) => Types.ObjectId.isValid(val), "Id không hợp lệ"),
    }),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>["body"];
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>["body"];
