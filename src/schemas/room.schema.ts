import { z } from "zod";
import { ROOM_STATUS } from "../constants/enum.js";

export const createRoomSchema = z.object({
    roomNumber: z.string().min(1, "Room number is required"),
    type: z.string().min(1, "Room type is required"),
    price: z.number().min(0, "Price must be greater than or equal to 0"),
    status: z.enum(ROOM_STATUS),
    area: z.number().min(0, "Area must be greater than or equal to 0"),
    maxPeople: z.number().min(0, "Max people must be greater than or equal to 0"),
    description: z.string().optional(),
    isDeleted: z.boolean().optional(),
})

export const roomIdParamsSchema = z.object({
    id: z.string().min(1, "Room ID is required"),
})

export type CreateRoomInput = z.infer<typeof createRoomSchema>
export type RoomIdParamsInput = z.infer<typeof roomIdParamsSchema>