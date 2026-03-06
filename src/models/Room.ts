import mongoose, { Schema, InferSchemaType } from "mongoose"
import { ROOM_STATUS, MAX_PEOPLE } from "../constants/enum.js"

const roomSchema = new Schema(
    {
        roomNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        type: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: Object.values(ROOM_STATUS),
            default: ROOM_STATUS.AVAILABLE,
        },
        area: {
            type: Number,
            required: true,
            min: 0,
        },
        maxPeople: {
            type: Number,
            enum: MAX_PEOPLE,
            default: 2,
        },
        description: {
            type: String,
            trim: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

console.log("MAX_PEOPLE:", Object.values(MAX_PEOPLE))

export type IRoom = InferSchemaType<typeof roomSchema>

export const Room = mongoose.model("Room", roomSchema, "Rooms")