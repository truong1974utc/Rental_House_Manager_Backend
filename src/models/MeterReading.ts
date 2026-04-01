import mongoose, { Schema, InferSchemaType } from "mongoose"
import { METER_READING_STATUS } from "../constants/enum.js"

const meterReadingSchema = new Schema(
    {
        roomId: {
            type: Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },
        month: {
            type: Number,
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        oldElectricIndex: {
            type: Number,
            required: true,
            min: 0,
        },
        newElectricIndex: {
            type: Number,
            required: true,
            min: 0,
        },
        electricUsed: {
            type: Number,
            required: true,
            min: 0,
        },
        electricUnitPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        electricAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        oldWaterIndex: {
            type: Number,
            required: true,
            min: 0,
        },
        newWaterIndex: {
            type: Number,
            required: true,
            min: 0,
        },
        waterUsed: {
            type: Number,
            required: true,
            min: 0,
        },
        waterUnitPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        waterAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: Object.values(METER_READING_STATUS),
            default: METER_READING_STATUS.UNBILLED,
        },
        recordedAt: {
            type: Date,
            default: Date.now,
        },
        note: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { timestamps: true }
)

// Compound index to ensure one meter reading per room per month/year
meterReadingSchema.index({ roomId: 1, month: 1, year: 1 }, { unique: true })

export type IMeterReading = InferSchemaType<typeof meterReadingSchema>
export const MeterReading = mongoose.model("MeterReading", meterReadingSchema, "Meter_readings")
