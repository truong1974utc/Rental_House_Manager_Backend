import { IServiceQuery } from "../interfaces/Query.js";
import { Service } from "../models/Service.js";

export const ServiceService = {
    getAllServices: async (query: IServiceQuery) => {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter: any = {};

        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: "i" } },
                { unit: { $regex: query.search, $options: "i" } },
                { type: { $regex: query.search, $options: "i" } }
            ]
        }

        if (query.type) {
            filter.type = query.type;
        }

        if (query.unit) {
            filter.unit = query.unit;
        }

        const [services, total] = await Promise.all([
            Service.find(filter).skip(skip).limit(limit),
            Service.countDocuments(filter)
        ])
        return {
            data: services,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                count: services.length
            }
        }
    }
}