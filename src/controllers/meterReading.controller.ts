import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { meterReadingService } from "../services/meterReading.service.js";

export class MeterReadingController {
    createMeterReading = asyncHandler(async (req: Request, res: Response) => {
        const meterReading = await meterReadingService.createMeterReading(req.body);
        res.status(201).json({
            success: true,
            data: meterReading,
            message: "Meter reading created successfully"
        });
    });

    getMeterReadings = asyncHandler(async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const filter = {
            roomId: req.query.roomId as string,
            month: req.query.month ? parseInt(req.query.month as string) : undefined,
            year: req.query.year ? parseInt(req.query.year as string) : undefined,
            status: req.query.status as string
        };

        const { data, total } = await meterReadingService.getMeterReadings(filter, skip, limit);

        res.status(200).json({
            success: true,
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                count: data.length
            },
            message: "Meter readings retrieved successfully"
        });
    });

    getMeterReadingById = asyncHandler(async (req: Request, res: Response) => {
        const meterReading = await meterReadingService.getMeterReadingById(req.params.id as string);
        if (!meterReading) {
            return res.status(404).json({
                success: false,
                message: "Meter reading not found"
            });
        }
        res.status(200).json({
            success: true,
            data: meterReading,
            message: "Meter reading retrieved successfully"
        });
    });

    updateMeterReading = asyncHandler(async (req: Request, res: Response) => {
        const meterReading = await meterReadingService.updateMeterReading(req.params.id as string, req.body);
        if (!meterReading) {
            return res.status(404).json({
                success: false,
                message: "Meter reading not found"
            });
        }
        res.status(200).json({
            success: true,
            data: meterReading,
            message: "Meter reading updated successfully"
        });
    });

    deleteMeterReading = asyncHandler(async (req: Request, res: Response) => {
        const success = await meterReadingService.deleteMeterReading(req.params.id as string);
        if (!success) {
            return res.status(404).json({
                success: false,
                message: "Meter reading not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Meter reading deleted successfully"
        });
    });

    getForInvoice = asyncHandler(async (req: Request, res: Response) => {
        const { roomId, month, year } = req.query;
        if (!roomId || !month || !year) {
            return res.status(400).json({
                success: false,
                message: "roomId, month, and year are required"
            });
        }

        const meterReading = await meterReadingService.getMeterReadingForInvoice(
            roomId as string, 
            parseInt(month as string), 
            parseInt(year as string)
        );
        
        res.status(200).json({
            success: true,
            data: meterReading,
            message: "Meter reading for invoice retrieved successfully"
        });
    });
}

export const meterReadingController = new MeterReadingController();
