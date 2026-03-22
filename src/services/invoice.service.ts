import { Invoice } from "../models/Invoice.js";
import { IInvoiceQuery } from "../interfaces/Query.js";
import { CreateInvoiceInput, UpdateInvoiceInput } from "../schemas/invoice.schema.js";
import { AlreadyExistsError } from "../errors/alreadyExists.error.js";

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

        if (query.isPaid !== undefined) {
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
    },
    createInvoice: async (invoiceData: CreateInvoiceInput) => {
        const existingInvoice = await Invoice.findOne({
            roomId: invoiceData.roomId,
            tenantId: invoiceData.tenantId,
            month: invoiceData.month,
            year: invoiceData.year
        });
        if (existingInvoice) {
            throw new AlreadyExistsError("Invoice for this room, tenant, month and year already exists");
        }
        const invoice = await Invoice.create(invoiceData);
        return invoice;
    },
    getInvoiceById: async (id: string) => {
        const invoice = await Invoice.findById(id)
            .populate("roomId", "roomNumber type price")
            .populate("tenantId", "fullName phone idCard");
        if (!invoice) {
            throw new Error("Invoice not found");
        }
        return invoice;
    },
    updateInvoice: async (id: string, invoiceData: UpdateInvoiceInput) => {
        const invoice = await Invoice.findByIdAndUpdate(id, invoiceData, { new: true });
        return invoice;
    },
    deleteInvoice: async (id: string) => {
        const invoice = await Invoice.findByIdAndDelete(id);
        return invoice;
    }
}
