import { ContractService } from "../services/contract.service.js";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CreateContractInput, UpdateContractInput } from "../schemas/contract.schema.js";
import { IContractQuery } from "../interfaces/Query.js";

export const ContractController = {
    createContract: asyncHandler(async (req: Request<{}, {}, CreateContractInput>, res: Response) => {
        const contract = await ContractService.createContract(req.body);
        res.status(201).json({
            success: true,
            message: "Create contract successfully",
            data: contract
        });
    }),
    getContractById: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const contract = await ContractService.getContractById(req.params.id);
        res.status(200).json({
            success: true,
            message: "Get contract successfully",
            data: contract
        });
    }),
    getAllContracts: asyncHandler(async (req: Request, res: Response) => {
        const query: IContractQuery = req.query;
        const result = await ContractService.getAllContracts(query);
        res.status(200).json({
            success: true,
            message: "Get all contracts successfully",
            data: result.data,
            meta: result.meta
        });
    }),
    updateContract: asyncHandler(async (req: Request<{ id: string }, {}, UpdateContractInput>, res: Response) => {
        const contract = await ContractService.updateContract(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Update contract successfully",
            data: contract
        });
    }),
    deleteContract: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const contract = await ContractService.deleteContract(req.params.id);
        res.status(200).json({
            success: true,
            message: "Delete contract successfully",
            data: contract
        });
    })
}