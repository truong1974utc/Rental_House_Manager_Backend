import mongoose, { InferSchemaType, Schema } from "mongoose";
import { SERVICE_TYPE, UNIT_SERVICE } from "../constants/enum.js";

const serviceSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        unit: {
            type: String,
            enum: UNIT_SERVICE,
            required: true
        },
        pricePerUnit: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: SERVICE_TYPE,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export type IService = InferSchemaType<typeof serviceSchema>
export const Service = mongoose.model("Service", serviceSchema, "Services");