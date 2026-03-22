import { z } from "zod";
import { SERVICE_TYPE, UNIT_SERVICE } from "../constants/enum.js";

export const createServiceSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Service name is required"),
        unit: z.enum(UNIT_SERVICE, { message: "Unit is required" }),
        pricePerUnit: z.number().min(0, "Price per unit must be greater than or equal to 0"),
        type: z.enum(SERVICE_TYPE, { message: "Type is required" }),
    })
})

export const updateServiceSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        unit: z.enum(UNIT_SERVICE).optional(),
        pricePerUnit: z.number().min(0).optional(),
        type: z.enum(SERVICE_TYPE).optional(),
    })
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>["body"]
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>["body"]
