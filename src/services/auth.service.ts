import { Tenant } from "../models/Tenant.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginInput } from "../schemas/auth.schema.js";
import { UnauthorizedError } from "../errors/unauthorized.error.js";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../config/env.js";

export const AuthService = {
    login: async (loginData: LoginInput) => {
        const tenant = await Tenant.findOne({
            $or: [{ email: loginData.email }, { phone: loginData.email }],
            isDeleted: false
        });
        
        if (!tenant) {
            throw new UnauthorizedError("Tài khoản không tồn tại");
        }

        const isPasswordMatch = await bcrypt.compare(loginData.password, tenant.password);
        if (!isPasswordMatch) {
            throw new UnauthorizedError("Sai mật khẩu");
        }

        const accessToken = jwt.sign(
            { id: tenant._id.toString() },
            JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: tenant._id.toString() },
            JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        const userObj = tenant.toObject();
        delete (userObj as any).password;

        return {
            accessToken,
            refreshToken,
            user: userObj
        };
    },
    
    getMe: async (id: string) => {
        const tenant = await Tenant.findById(id);
        if (!tenant || tenant.isDeleted) {
            throw new UnauthorizedError("User not found or deleted");
        }
        
        const userObj = tenant.toObject();
        delete (userObj as any).password;
        
        return userObj;
    },
    
    refreshToken: async (token: string) => {
        try {
            const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
            const tenant = await Tenant.findById(decoded.id);
            
            if (!tenant || tenant.isDeleted) {
                throw new UnauthorizedError("User no longer exists");
            }

            const accessToken = jwt.sign(
                { id: tenant._id.toString() },
                JWT_SECRET,
                { expiresIn: "15m" }
            );

            const newRefreshToken = jwt.sign(
                { id: tenant._id.toString() },
                JWT_REFRESH_SECRET,
                { expiresIn: "7d" }
            );

            return {
                accessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            throw new UnauthorizedError("Invalid or expired refresh token");
        }
    }
}
