import mongoose, { Schema, InferSchemaType } from "mongoose"
import { ROOM_STATUS, MAX_PEOPLE, ROOM_TYPE } from "../constants/enum.js"

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
            enum: Object.values(ROOM_TYPE),
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
            default: "",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

export type IRoom = InferSchemaType<typeof roomSchema>

export const Room = mongoose.model("Room", roomSchema, "Rooms")