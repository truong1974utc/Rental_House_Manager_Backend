import { Contract } from "../models/Contract.js";
import { IContractQuery } from "../interfaces/Query.js";
import { CreateContractInput, UpdateContractInput } from "../schemas/contract.schema.js";
import mongoose from "mongoose";

const CHECKOUT_STATUSES = ["ACTIVE", "TERMINATED"];
const CHECKOUT_ENDED_STATUSES = ["TERMINATED", "CANCELLED"];

const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const getEffectiveContractStatus = (contract: any) => {
    if (contract.status === "CANCELLED") return "CANCELLED";
    if (contract.status === "TERMINATED" || contract.status === "EXPIRED") return "TERMINATED";

    const endDate = new Date(contract.endDate);
    endDate.setHours(0, 0, 0, 0);

    if (!Number.isNaN(endDate.getTime()) && endDate < getStartOfToday()) {
        return "TERMINATED";
    }

    return contract.status;
};

export const ContractService = {
    getAllContracts: async (query: IContractQuery, options?: { checkoutOnly?: boolean }) => {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const checkoutOnly = options?.checkoutOnly || false;
        const today = getStartOfToday();

        if (checkoutOnly && query.status && !CHECKOUT_STATUSES.includes(query.status)) {
            return {
                data: [],
                meta: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                    count: 0
                }
            };
        }

        const match: any = {};

        if (query.status) {
            match.status = query.status;
        }

        if (query.roomId) {
            match.roomId = new mongoose.Types.ObjectId(query.roomId);
        }

        const pipeline: any[] = [
            {
                $addFields: {
                    status: {
                        $cond: [
                            {
                                $or: [
                                    { $in: ["$status", ["TERMINATED", "EXPIRED"]] },
                                    {
                                        $and: [
                                            { $ne: ["$status", "CANCELLED"] },
                                            { $lt: ["$endDate", today] }
                                        ]
                                    }
                                ]
                            },
                            "TERMINATED",
                            "$status"
                        ]
                    }
                }
            },
            ...(checkoutOnly ? [{
                $addFields: {
                    status: {
                        $cond: [
                            { $in: ["$status", CHECKOUT_ENDED_STATUSES] },
                            "TERMINATED",
                            "ACTIVE"
                        ]
                    }
                }
            }] : []),
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
    getCheckoutContracts: async (query: IContractQuery) => {
        return ContractService.getAllContracts(query, { checkoutOnly: true });
    },
    createContract: async (contractData: CreateContractInput) => {
        const contract = await Contract.create(contractData);

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
            status: getEffectiveContractStatus(doc),
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
            status: getEffectiveContractStatus(doc),
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
            status: getEffectiveContractStatus(doc),
            tenant: doc.representativeTenantId,
            room: doc.roomId
        };
    },
    deleteContract: async (id: string) => {
        const contract = await Contract.findByIdAndDelete(id);
        return contract;
    }
}
