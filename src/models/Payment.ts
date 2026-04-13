import mongoose, { InferSchemaType, Schema } from "mongoose";

const paymentSchema = new Schema(
    {
        invoiceId: {
            type: Schema.Types.ObjectId,
            ref: "Invoice",
            required: true
        },
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
        amount: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ["CASH", "TRANSFER", "MOMO"],
            default: "MOMO"
        },
        status: {
            type: String,
            enum: ["PENDING", "SUCCESS", "FAILED"],
            default: "PENDING"
        },
        transactionId: {
            type: String, // e.g. momo orderId
            required: false
        },
        payUrl: {
            type: String, // url to redirect user to MoMo
            required: false
        },
        qrCodeUrl: {
            type: String,
            required: false
        },
        paymentDate: {
            type: Date,
            required: false
        }
    },
    {
        timestamps: true
    }
);

export type IPayment = InferSchemaType<typeof paymentSchema>;
export const Payment = mongoose.model("Payment", paymentSchema, "Payments");
