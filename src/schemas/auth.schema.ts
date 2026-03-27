import { z } from "zod";

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password must be at least 6 characters")
    })
});

export type LoginInput = z.infer<typeof loginSchema>["body"];

export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, "Refresh token is required")
    })
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"];
