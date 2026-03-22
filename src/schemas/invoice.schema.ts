import { z } from "zod";

const otherFeeSchema = z.object({
    serviceId: z.string().min(1, "Service ID is required"),
    quantity: z.number().min(0, "Quantity must be greater than or equal to 0"),
    price: z.number().min(0, "Price must be greater than or equal to 0"),
    total: z.number().min(0, "Total must be greater than or equal to 0"),
})

export const createInvoiceSchema = z.object({
    body: z.object({
        roomId: z.string().min(1, "Room ID is required"),
        tenantId: z.string().min(1, "Tenant ID is required"),
        month: z.number().int().min(1).max(12, "Month must be between 1 and 12"),
        year: z.number().int().min(2000, "Year must be greater than or equal to 2000"),
        roomPrice: z.number().min(0, "Room price must be greater than or equal to 0"),
        otherFees: z.array(otherFeeSchema).optional().default([]),
        totalAmount: z.number().min(0, "Total amount must be greater than or equal to 0"),
        isPaid: z.boolean({ message: "isPaid is required" }),
        paymentDate: z.coerce.date({ message: "Payment date is required" }),
    })
})

export const updateInvoiceSchema = z.object({
    body: z.object({
        roomId: z.string().optional(),
        tenantId: z.string().optional(),
        month: z.number().int().min(1).max(12).optional(),
        year: z.number().int().min(2000).optional(),
        roomPrice: z.number().min(0).optional(),
        otherFees: z.array(otherFeeSchema).optional(),
        totalAmount: z.number().min(0).optional(),
        isPaid: z.boolean().optional(),
        paymentDate: z.coerce.date().optional(),
    })
})

export type OtherFeeInput = z.infer<typeof otherFeeSchema>
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>["body"]
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>["body"]
