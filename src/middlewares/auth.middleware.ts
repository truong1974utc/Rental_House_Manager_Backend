import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/unauthorized.error.js";
import { Tenant } from "../models/Tenant.js";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_from_antigravity";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new UnauthorizedError("No token provided or invalid format"));
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return next(new UnauthorizedError("Access token is missing"));
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return next(new UnauthorizedError("Invalid or expired token"));
        }

        const tenant = await Tenant.findById(decoded.id);

        if (!tenant || tenant.isDeleted) {
            return next(new UnauthorizedError("User no longer exists"));
        }

        // Attach tenant to request
        req.tenant = tenant as any;
        next();
    } catch (error) {
        next(error);
    }
};
