import { asyncHandler } from "../utils/asyncHandler.js";
import { Request, Response } from "express";
import { IServiceQuery } from "../interfaces/Query.js";
import { ServiceService } from "../services/service.service.js";

export const ServiceController = {
    getAllServices: asyncHandler(async (req: Request, res: Response) => {
        const query: IServiceQuery = req.query;
        const services = await ServiceService.getAllServices(query);
        res.status(200).json(services);
    })
}