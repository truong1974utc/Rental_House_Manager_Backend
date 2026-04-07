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
            required: true
        }
    },
    { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);