import { z } from "zod";
import { ROOM_STATUS, ROOM_TYPE } from "../constants/enum.js";

export const createRoomSchema = z.object({
    body: z.object({
        roomNumber: z.string().min(1, "Room number is required"),
        type: z.enum(ROOM_TYPE),
        price: z.number().min(0, "Price must be greater than or equal to 0"),
        area: z.number().min(0, "Area must be greater than or equal to 0"),
        maxPeople: z.number().int().min(1, "Max people must be greater than or equal to 1"),
        status: z.enum(ROOM_STATUS).optional(),
        description: z.string().optional(),
        representativeTenantId: z.string().nullable().optional(),
    })
})

export const updateRoomSchema = z.object({
    body: z.object({
        roomNumber: z.string().optional(),
        type: z.enum(ROOM_TYPE).optional(),
        price: z.number().min(0).optional(),
        area: z.number().min(0).optional(),
        maxPeople: z.number().int().min(1).optional(),
        status: z.enum(ROOM_STATUS).optional(),
        description: z.string().optional(),
        representativeTenantId: z.string().nullable().optional(),
    })
})

export type CreateRoomInput = z.infer<typeof createRoomSchema>["body"]
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>["body"]
