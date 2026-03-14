import { Tenant } from "../models/Tenant.js";
import { ITenantQuery } from "../interfaces/Query.js";
import mongoose from "mongoose";

export const TenantService = {
    getAllTenants: async (query: ITenantQuery) => {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter: any = {};

        if (query.search) {
            filter.$or = [
                { fullName: { $regex: query.search, $options: "i" } },
                { phone: { $regex: query.search, $options: "i" } },
                { idCard: { $regex: query.search, $options: "i" } },
                { email: { $regex: query.search, $options: "i" } },
                { address: { $regex: query.search, $options: "i" } }
            ]
        }

        if (query.roomId) {
            filter.roomId = new mongoose.Types.ObjectId(query.roomId);
        }

        if (query.isRepresent) {
            filter.isRepresent = query.isRepresent;
        }

        const [tenants, total] = await Promise.all([
            Tenant.find(filter).skip(skip).limit(limit),
            Tenant.countDocuments(filter)
        ])
        return {
            data: tenants,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                count: tenants.length
            }
        }
    }
}