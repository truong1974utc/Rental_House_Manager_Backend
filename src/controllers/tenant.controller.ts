import { TenantService } from "../services/tenant.service.js";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CreateTenantInput, UpdateTenantInput } from "../schemas/tenant.schema.js";
import { ITenantQuery } from "../interfaces/Query.js";

export const TenantController = {
    createTenant: asyncHandler(async (req: Request<{}, {}, CreateTenantInput>, res: Response) => {
        const tenant = await TenantService.createTenant(req.body);
        res.status(201).json({
            success: true,
            message: "Create tenant successfully",
            data: tenant
        });
    }),
    getTenantById: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const tenant = await TenantService.getTenantById(req.params.id);
        res.status(200).json({
            success: true,
            message: "Get tenant successfully",
            data: tenant
        });
    }),
    getAllTenants: asyncHandler(async (req: Request, res: Response) => {
        const query: ITenantQuery = req.query;
        const result = await TenantService.getAllTenants(query);
        res.status(200).json({
            success: true,
            message: "Get all tenants successfully",
            data: result.data,
            meta: result.meta
        });
    }),
    updateTenant: asyncHandler(async (req: Request<{ id: string }, {}, UpdateTenantInput>, res: Response) => {
        const tenant = await TenantService.updateTenant(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Update tenant successfully",
            data: tenant
        });
    }),
    deleteTenant: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const tenant = await TenantService.deleteTenant(req.params.id);
        res.status(200).json({
            success: true,
            message: "Delete tenant successfully",
            data: tenant
        });
    })
}