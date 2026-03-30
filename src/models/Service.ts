import mongoose, { InferSchemaType, Schema } from "mongoose";

const serviceSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        unit: {
            type: String,
            required: true
        },
        pricePerUnit: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export type IService = InferSchemaType<typeof serviceSchema>
export const Service = mongoose.model("Service", serviceSchema, "Services");