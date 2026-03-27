import { Tenant } from "../models/Tenant.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginInput } from "../schemas/auth.schema.js";
import { UnauthorizedError } from "../errors/unauthorized.error.js";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_from_antigravity";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "super_refresh_secret_key_from_antigravity";

export const AuthService = {
    login: async (loginData: LoginInput) => {
        const tenant = await Tenant.findOne({ email: loginData.email, isDeleted: false });
        
        if (!tenant) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const isPasswordMatch = await bcrypt.compare(loginData.password, tenant.password);
        if (!isPasswordMatch) {
            throw new UnauthorizedError("Invalid email or password");
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
