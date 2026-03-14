import { Invoice } from "../models/Invoice.js";
import { IInvoiceQuery } from "../interfaces/Query.js";

export const InvoiceService = {
    getAllInvoices: async (query: IInvoiceQuery) => {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const match: any = {};

        if (query.roomId) {
            match.roomId = query.roomId;
        }

        if (query.tenantId) {
            match.tenantId = query.tenantId;
        }

        if (query.month) {
            match.month = query.month;
        }

        if (query.year) {
            match.year = query.year;
        }

        if (query.isPaid) {
            match.isPaid = query.isPaid;
        }

        const pipeline: any[] = [
            {
                $lookup: {
                    from: "Tenants",
                    localField: "tenantId",
                    foreignField: "_id",
                    as: "tenant"
                }
            },
            {
                $unwind: {
                    path: "$tenant",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: "Rooms",
                    localField: "roomId",
                    foreignField: "_id",
                    as: "room"
                }
            },
            {
                $unwind: {
                    path: "$room",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "Services",
                    localField: "otherFees.serviceId",
                    foreignField: "_id",
                    as: "service"
                }
            },
            {
                $unwind: {
                    path: "$service",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    "otherFees.serviceName": "$service.name"
                }
            },
            {
                $project: {
                    service: 0,
                }
            },
            {
                $match: {
                    ...match,
                    ...(query.search && {
                        $or: [
                            { "tenant.fullName": { $regex: query.search, $options: "i" } },
                            { "tenant.idCard": { $regex: query.search, $options: "i" } },
                            { "room.roomNumber": { $regex: query.search, $options: "i" } }
                        ]
                    })
                }
            },

            { $skip: skip },
            { $limit: limit }
        ];

        const invoices = await Invoice.aggregate(pipeline);

        const totalResult = await Invoice.aggregate([
            ...pipeline.slice(0, -2),
            { $count: "total" }
        ]);

        const total = totalResult[0]?.total || 0;

        return {
            data: invoices,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                count: invoices.length
            }
        };
    }
}
