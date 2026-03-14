import mongoose, { InferSchemaType, Schema } from "mongoose";
import { STATUS } from "../constants/enum.js";

const contractSchema = new Schema(
    {
        roomId: {
            type: Schema.Types.ObjectId,
            ref: "Room",
            required: true
        },
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: "Tenant",
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        deposit: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: STATUS,
            default: STATUS.ACTIVE
        }
    },
    {
        timestamps: true
    }
)

export type IContract = InferSchemaType<typeof contractSchema>
export const Contract = mongoose.model("Contract", contractSchema, "Contracts");