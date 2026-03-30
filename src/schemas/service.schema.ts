import { z } from "zod";

export const createServiceSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Service name is required"),
        unit: z.string(),
        pricePerUnit: z.number().min(0, "Price per unit must be greater than or equal to 0"),
        type: z.string(),
    })
})

export const updateServiceSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        unit: z.string().optional(),
        pricePerUnit: z.number().min(0).optional(),
        type: z.string().optional(),
    })
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>["body"]
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>["body"]
