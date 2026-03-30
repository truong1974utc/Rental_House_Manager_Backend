import { z } from "zod";
import { GENDER } from "../constants/enum.js";

export const createTenantSchema = z.object({
    body: z.object({
        roomId: z.string().min(1, "Room ID is required"),
        fullName: z.string().min(1, "Full name is required xxxxxx"),
        phone: z.string().min(1, "Phone is required"),
        idCard: z.string().min(1, "ID card is required"),
        email: z.string().email("Invalid email"),
        address: z.string().min(1, "Address is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        birthDate: z.coerce.date({ message: "Birth date is required" }),
        gender: z.enum(GENDER, { message: "Gender is required" }),
    })
})

export const updateTenantSchema = z.object({
    body: z.object({
        roomId: z.string().optional(),
        fullName: z.string().optional(),
        phone: z.string().optional(),
        idCard: z.string().optional(),
        email: z.string().email("Invalid email").optional(),
        password: z.string().min(6, "Password must be at least 6 characters").optional(),
        address: z.string().optional(),
        birthDate: z.coerce.date().optional(),
        gender: z.enum(GENDER).optional(),
    })
})

export type CreateTenantInput = z.infer<typeof createTenantSchema>["body"]
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>["body"]
