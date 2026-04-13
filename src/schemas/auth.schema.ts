import { z } from "zod";

export const loginSchema = z.object({
    body: z.object({
        email: z.string().min(1, "Email or Phone is required"), // Changed from email() as user might use phone
        password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    })
});

export type LoginInput = z.infer<typeof loginSchema>["body"];

export const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, "Refresh token is required")
    })
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"];
