import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: "Tenant",
            required: true
        },
        text: {
            type: String,
            default: ""
        },
        imageUrl: {
            type: String,
            default: ""
        },
        imageName: {
            type: String,
            default: ""
        },
        fileUrl: {
            type: String,
            default: ""
        },
        fileName: {
            type: String,
            default: ""
        },
        fileType: {
            type: String,
            default: ""
        },
        fileSize: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

messageSchema.path("text").validate(function (value: string) {
    const message = this as any;
    return Boolean(value?.trim() || message.imageUrl || message.fileUrl);
}, "Message text, image, or file is required");

export const Message = mongoose.model("Message", messageSchema);
