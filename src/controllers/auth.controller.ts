import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthService } from "../services/auth.service.js";
import { LoginInput } from "../schemas/auth.schema.js";

export const AuthController = {
    login: asyncHandler(async (req: Request<{}, {}, LoginInput>, res: Response) => {
        const result = await AuthService.login(req.body);
        res.status(200).json({
            success: true,
            message: "Login successful",
            ...result
        });
    }),
    
    me: asyncHandler(async (req: Request, res: Response) => {
        // req.tenant is populated from authMiddleware
        const tenantId = req.tenant?._id.toString();
        if (!tenantId) {
            throw new Error("Tenant ID missing from request in AuthController.me");
        }
        
        const user = await AuthService.getMe(tenantId);
        res.status(200).json({
            success: true,
            message: "Get profile successful",
            data: user
        });
    }),
    
    refreshToken: asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        const result = await AuthService.refreshToken(refreshToken);
        res.status(200).json({
            success: true,
            message: "Refresh token successful",
            ...result
        });
    })
};
