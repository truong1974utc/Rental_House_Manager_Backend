import { z } from "zod";
import { STATUS } from "../constants/enum.js";

export const createContractSchema = z.object({
    body: z.object({
        roomId: z.string().min(1, "Room ID is required"),
        representativeTenantId: z.string().min(1, "Representative tenant ID is required"),
        startDate: z.coerce.date({ message: "Start date is required" }),
        endDate: z.coerce.date({ message: "End date is required" }),
        deposit: z.number().min(0, "Deposit must be greater than or equal to 0"),
        monthlyRent: z.number().min(0, "Monthly rent must be greater than or equal to 0"),
        note: z.string().optional().default(""),
        status: z.enum(STATUS).default(STATUS.ACTIVE)
    }).refine(data => data.endDate > data.startDate, {
        message: "End date must be after start date",
        path: ["endDate"],
    })
})

export const updateContractSchema = z.object({
    body: z.object({
        roomId: z.string().optional(),
        representativeTenantId: z.string().optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        deposit: z.number().min(0).optional(),
        monthlyRent: z.number().min(0).optional(),
        note: z.string().optional(),
        status: z.enum(STATUS).optional(),
    })
})

export type CreateContractInput = z.infer<typeof createContractSchema>["body"]
export type UpdateContractInput = z.infer<typeof updateContractSchema>["body"]
