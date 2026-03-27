import { Tenant } from "../models/Tenant.js";
import { ITenantQuery } from "../interfaces/Query.js";
import { CreateTenantInput, UpdateTenantInput } from "../schemas/tenant.schema.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { AlreadyExistsError } from "../errors/alreadyExists.error.js";

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

        if (query.isRepresent !== undefined) {
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
    },
    createTenant: async (tenantData: CreateTenantInput) => {
        const existingTenant = await Tenant.findOne({ idCard: tenantData.idCard });
        if (existingTenant) {
            throw new AlreadyExistsError("Tenant with this ID card already exists");
        }
        
        // Hash password before saving
        const hashedPassword = await bcrypt.hash(tenantData.password, 10);
        const dataToSave = { ...tenantData, password: hashedPassword };

        const tenant = await Tenant.create(dataToSave);
        return tenant;
    },
    getTenantById: async (id: string) => {
        const tenant = await Tenant.findById(id);
        if (!tenant) {
            throw new Error("Tenant not found");
        }
        return tenant;
    },
    updateTenant: async (id: string, tenantData: UpdateTenantInput) => {
        const tenant = await Tenant.findByIdAndUpdate(id, tenantData, {
            returnDocument: "after",
            runValidators: true
        });
        if (!tenant) {
            throw new Error("Tenant not found");
        }
        return tenant;
    },
    deleteTenant: async (id: string) => {
        const tenant = await Tenant.findByIdAndDelete(id);
        if (!tenant) {
            throw new Error("Tenant not found");
        }
        return tenant;
    }
}