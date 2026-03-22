import { Contract } from "../models/Contract.js";
import { IContractQuery } from "../interfaces/Query.js";
import { CreateContractInput, UpdateContractInput } from "../schemas/contract.schema.js";
import mongoose from "mongoose";
import { AlreadyExistsError } from "../errors/alreadyExists.error.js";

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

        if (query.tenantId) {
            match.tenantId = new mongoose.Types.ObjectId(query.tenantId);
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
        const existingContract = await Contract.findOne({
            roomId: contractData.roomId
        });
        if (existingContract) {
            throw new AlreadyExistsError("Contract for this room already exists");
        }
        const contract = await Contract.create(contractData);
        return contract;
    },
    getContractById: async (id: string) => {
        const contract = await Contract.findById(id)
            .populate("roomId", "roomNumber type price")
            .populate("tenantId", "fullName phone idCard");
        if (!contract) {
            throw new Error("Contract not found");
        }
        return contract;
    },
    updateContract: async (id: string, contractData: UpdateContractInput) => {
        const contract = await Contract.findByIdAndUpdate(id, contractData, { new: true });
        return contract;
    },
    deleteContract: async (id: string) => {
        const contract = await Contract.findByIdAndDelete(id);
        return contract;
    }
}