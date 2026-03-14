import { asyncHandler } from "../utils/asyncHandler.js";
import { Response, Request } from "express";
import { ContractService } from "../services/contract.service.js";
import { IContractQuery } from "../interfaces/Query.js";

export const ContractController = {
    getAllContracts: asyncHandler(async (req: Request, res: Response) => {
        const query: IContractQuery = req.query;
        const result = await ContractService.getAllContracts(query);
        res.status(200).json(result);
    })
}