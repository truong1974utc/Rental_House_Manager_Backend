import mongoose, { Schema } from "mongoose";
import { NOTIFICATION_TYPE } from "../constants/enum.js";

const notificationSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Vui lòng nhập tiêu đề thông báo"],
            trim: true,
        },
        message: {
            type: String,
            required: [true, "Vui lòng nhập nội dung thông báo"],
        },
        type: {
            type: String,
            enum: Object.values(NOTIFICATION_TYPE),
            default: NOTIFICATION_TYPE.GENERAL,
        },
        isGlobal: {
            type: Boolean,
            default: false,
        },
        roomId: {
            type: Schema.Types.ObjectId,
            ref: "Room",
            default: null,
        },
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: "Tenant",
            default: null,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
