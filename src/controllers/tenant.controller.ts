import { TenantService } from "../services/tenant.service.js";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ITenantQuery } from "../interfaces/Query.js";

export const TenantController = {
    getAllTenants: asyncHandler(async (req: Request, res: Response) => {
        const query: ITenantQuery = req.query;
        const tenants = await TenantService.getAllTenants(query);
        res.status(200).json(tenants);
    })
}