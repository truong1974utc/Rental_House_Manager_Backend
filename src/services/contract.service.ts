import { Contract } from "../models/Contract.js";
import { IContractQuery } from "../interfaces/Query.js";
import { CreateContractInput, UpdateContractInput } from "../schemas/contract.schema.js";
import mongoose from "mongoose";
import { AlreadyExistsError } from "../errors/alreadyExists.error.js";
import { InvoiceService } from "./invoice.service.js";

export const ContractService = {
    getAllContracts: async (query: IContractQuery) => {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const match: any = {};

        if (query.status) {
            match.status = query.status;
        }

        if (query.roomId) {
            match.roomId = new mongoose.Types.ObjectId(query.roomId);
        }

        const pipeline: any[] = [
            {
                $lookup: {
                    from: "Tenants",
                    localField: "representativeTenantId",
                    foreignField: "_id",
                    as: "representativeTenant"
                }
            },
            {
                $unwind: {
                    path: "$representativeTenant",
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
                $match: {
                    ...match,
                    ...(query.search && {
                        $or: [
                            { "representativeTenant.fullName": { $regex: query.search, $options: "i" } },
                            { "representativeTenant.idCard": { $regex: query.search, $options: "i" } },
                            { "room.roomNumber": { $regex: query.search, $options: "i" } }
                        ]
                    })
                }
            },
            {
                $addFields: {
                    tenant: "$representativeTenant"
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ];

        const contracts = await Contract.aggregate(pipeline);

        const totalResult = await Contract.aggregate([
            ...pipeline.slice(0, -2),
            { $count: "total" }
        ]);

        const total = totalResult[0]?.total || 0;

        return {
            data: contracts,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                count: contracts.length
            }
        };
    },
    createContract: async (contractData: CreateContractInput) => {
        const contract = await Contract.create(contractData);

        if (contractData.deposit > 0) {
            const currentDate = new Date();
            try {
                await InvoiceService.createInvoice({
                    roomId: contractData.roomId,
                    tenantId: contractData.representativeTenantId,
                    type: "DEPOSIT",
                    month: currentDate.getMonth() + 1,
                    year: currentDate.getFullYear(),
                    roomPrice: 0,
                    otherFees: [],
                    totalAmount: contractData.deposit,
                    isPaid: false
                });
            } catch (error) {
                console.error("Lỗi khi tạo hóa đơn tiền cọc:", error);
            }
        }

        if (contractData.status === "ACTIVE") {
            await mongoose.model("Room").findByIdAndUpdate(contractData.roomId, {
                status: "OCCUPIED",
                representativeTenantId: contractData.representativeTenantId
            });
            await mongoose.model("Tenant").findByIdAndUpdate(
                contractData.representativeTenantId,
                { roomId: contractData.roomId }
            );
        }

        const populated = await contract.populate([
            { path: "roomId", select: "roomNumber type price maxPeople" },
            { path: "representativeTenantId", select: "fullName phone idCard" }
        ]);
        const doc = populated.toObject ? populated.toObject() : populated;
        return {
            ...doc,
            tenant: doc.representativeTenantId,
            room: doc.roomId
        };
    },
    getContractById: async (id: string) => {
        const contract = await Contract.findById(id)
            .populate("roomId", "roomNumber type price maxPeople")
            .populate("representativeTenantId", "fullName phone idCard");
        if (!contract) {
            throw new Error("Contract not found");
        }
        const doc = contract.toObject ? contract.toObject() : contract;
        return {
            ...doc,
            tenant: doc.representativeTenantId,
            room: doc.roomId
        };
    },
    updateContract: async (id: string, contractData: UpdateContractInput) => {
        const contract = await Contract.findByIdAndUpdate(id, contractData, { new: true })
            .populate("roomId", "roomNumber type price maxPeople")
            .populate("representativeTenantId", "fullName phone idCard");
        if (!contract) {
            throw new Error("Contract not found");
        }

        if (contractData.status === "TERMINATED" || contractData.status === "EXPIRED" || contractData.status === "CANCELLED") {
            await mongoose.model("Room").findByIdAndUpdate(contract.roomId, { 
                status: "AVAILABLE",
                $unset: { representativeTenantId: "" }
            });
            await mongoose.model("Tenant").updateMany(
                { roomId: contract.roomId },
                { $unset: { roomId: "" } }
            );
        } else if (contractData.status === "ACTIVE") {
            const updateRoomData: any = { status: "OCCUPIED" };
            if (contract.representativeTenantId) {
                updateRoomData.representativeTenantId = contract.representativeTenantId;
            }
            await mongoose.model("Room").findByIdAndUpdate(contract.roomId, updateRoomData);
            
            if (contract.representativeTenantId) {
                await mongoose.model("Tenant").findByIdAndUpdate(
                    contract.representativeTenantId,
                    { roomId: contract.roomId }
                );
            }
        }

        const doc = contract.toObject ? contract.toObject() : contract;
        return {
            ...doc,
            tenant: doc.representativeTenantId,
            room: doc.roomId
        };
    },
    deleteContract: async (id: string) => {
        const contract = await Contract.findByIdAndDelete(id);
        return contract;
    }
}