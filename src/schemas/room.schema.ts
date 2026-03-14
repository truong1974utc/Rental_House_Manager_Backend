import { z } from "zod";
import { ROOM_TYPE, MAX_PEOPLE } from "../constants/enum.js";

export const createRoomSchema = z.object({
    body: z.object({
        roomNumber: z.string().min(1, "Room number is required"),
        type: z.enum(ROOM_TYPE),
        price: z.number().min(0, "Price must be greater than or equal to 0"),
        area: z.number().min(0, "Area must be greater than or equal to 0"),
        maxPeople: z.enum(MAX_PEOPLE),
        description: z.string().optional(),
    })
})

export const roomIdParamsSchema = z.object({
    id: z.string().min(1, "Room ID is required"),
})

export type CreateRoomInput = z.infer<typeof createRoomSchema>["body"]
export type RoomIdParamsInput = z.infer<typeof roomIdParamsSchema>