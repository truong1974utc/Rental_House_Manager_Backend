import { z } from "zod";
import { STATUS } from "../constants/enum.js";

export const createContractSchema = z.object({
    body: z.object({
        roomId: z.string().min(1, "Room ID is required"),
        tenantId: z.string().min(1, "Tenant ID is required"),
        startDate: z.coerce.date({ message: "Start date is required" }),
        endDate: z.coerce.date({ message: "End date is required" }),
        deposit: z.number().min(0, "Deposit must be greater than or equal to 0"),
    }).refine(data => data.endDate > data.startDate, {
        message: "End date must be after start date",
        path: ["endDate"],
    })
})

export const updateContractSchema = z.object({
    body: z.object({
        roomId: z.string().optional(),
        tenantId: z.string().optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        deposit: z.number().min(0).optional(),
        status: z.enum(STATUS).optional(),
    })
})

export type CreateContractInput = z.infer<typeof createContractSchema>["body"]
export type UpdateContractInput = z.infer<typeof updateContractSchema>["body"]
