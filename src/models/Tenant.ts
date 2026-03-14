import mongoose, { Schema, InferSchemaType } from "mongoose";
import { GENDER } from "../constants/enum.js";

const tenantSchema = new Schema(
    {
        roomId: {
            type: Schema.Types.ObjectId,
            ref: "Room",
            required: true
        },
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        idCard: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        birthDate: {
            type: Date,
            required: true
        },
        gender: {
            type: String,
            enum: Object.values(GENDER),
            required: true
        },
        isRepresent: {
            type: Boolean,
            default: false
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

export type ITenant = InferSchemaType<typeof tenantSchema>

export const Tenant = mongoose.model("Tenant", tenantSchema, "Tenants")