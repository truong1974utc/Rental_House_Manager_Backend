import { ServiceService } from "../services/service.service.js";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CreateServiceInput, UpdateServiceInput } from "../schemas/service.schema.js";
import { IServiceQuery } from "../interfaces/Query.js";

export const ServiceController = {
    createService: asyncHandler(async (req: Request<{}, {}, CreateServiceInput>, res: Response) => {
        const service = await ServiceService.createService(req.body);
        res.status(201).json({
            success: true,
            message: "Create service successfully",
            data: service
        });
    }),
    getServiceById: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const service = await ServiceService.getServiceById(req.params.id);
        res.status(200).json({
            success: true,
            message: "Get service successfully",
            data: service
        });
    }),
    getAllServices: asyncHandler(async (req: Request, res: Response) => {
        const query: IServiceQuery = req.query;
        const result = await ServiceService.getAllServices(query);
        res.status(200).json({
            success: true,
            message: "Get all services successfully",
            data: result.data,
            meta: result.meta
        });
    }),
    updateService: asyncHandler(async (req: Request<{ id: string }, {}, UpdateServiceInput>, res: Response) => {
        const service = await ServiceService.updateService(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Update service successfully",
            data: service
        });
    }),
    deleteService: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const service = await ServiceService.deleteService(req.params.id);
        res.status(200).json({
            success: true,
            message: "Delete service successfully",
            data: service
        });
    })
}