import mongoose, { InferSchemaType, Schema } from "mongoose";

const otherFeeSchema = new Schema(
    {
        serviceId: {
            type: Schema.Types.ObjectId,
            ref: "Service",
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        }
    }
)

const invoiceSchema = new Schema(
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
        month: {
            type: Number,
            required: true
        },
        year: {
            type: Number,
            required: true
        },
        roomPrice: {
            type: Number,
            required: true
        },
        otherFees: [otherFeeSchema],
        totalAmount: {
            type: Number,
            required: true
        },
        isPaid: {
            type: Boolean,
            required: true
        },
        paymentDate: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export type IInvoice = InferSchemaType<typeof invoiceSchema>
export type IOtherFee = InferSchemaType<typeof otherFeeSchema>

export const Invoice = mongoose.model("Invoice", invoiceSchema, "Invoices");