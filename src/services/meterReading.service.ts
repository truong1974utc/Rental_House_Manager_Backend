import { MeterReading } from "../models/MeterReading.js";
import { CreateMeterReadingInput, UpdateMeterReadingInput } from "../schemas/meterReading.schema.js";
import { AlreadyExistsError } from "../errors/alreadyExists.error.js";
import mongoose from "mongoose";

export class MeterReadingService {
    async createMeterReading(data: CreateMeterReadingInput) {
        // Check if exists
        const exists = await MeterReading.findOne({
            roomId: data.roomId,
            month: data.month,
            year: data.year
        });

        if (exists) {
            throw new AlreadyExistsError("Meter reading for this room in this month/year already exists");
        }

        const electricUsed = data.newElectricIndex - data.oldElectricIndex;
        const electricAmount = electricUsed * data.electricUnitPrice;

        const waterUsed = data.newWaterIndex - data.oldWaterIndex;
        const waterAmount = waterUsed * data.waterUnitPrice;

        const meterReading = new MeterReading({
            ...data,
            electricUsed,
            electricAmount,
            waterUsed,
            waterAmount
        });

        await meterReading.save();
        return meterReading;
    }

    async getMeterReadings(filter: any, skip: number, limit: number) {
        const query: any = {};
        if (filter.roomId) query.roomId = new mongoose.Types.ObjectId(filter.roomId);
        if (filter.month) query.month = filter.month;
        if (filter.year) query.year = filter.year;
        if (filter.status) query.status = filter.status;

        const meterReadings = await MeterReading.find(query)
            .populate("roomId", "roomNumber")
            .skip(skip)
            .limit(limit)
            .sort({ year: -1, month: -1 });

        const total = await MeterReading.countDocuments(query);

        return {
            data: meterReadings,
            total
        };
    }

    async getMeterReadingById(id: string) {
        return await MeterReading.findById(id).populate("roomId", "roomNumber");
    }

    async updateMeterReading(id: string, data: UpdateMeterReadingInput) {
        const existingReading = await MeterReading.findById(id);
        if (!existingReading) return null;

        const updateData: any = { ...data };

        // Recalculate amounts if indexes or prices change
        const oldElec = data.oldElectricIndex ?? existingReading.oldElectricIndex;
        const newElec = data.newElectricIndex ?? existingReading.newElectricIndex;
        const elecPrice = data.electricUnitPrice ?? existingReading.electricUnitPrice;
        
        if (data.oldElectricIndex !== undefined || data.newElectricIndex !== undefined || data.electricUnitPrice !== undefined) {
            updateData.electricUsed = newElec - oldElec;
            updateData.electricAmount = updateData.electricUsed * elecPrice;
        }

        const oldWater = data.oldWaterIndex ?? existingReading.oldWaterIndex;
        const newWater = data.newWaterIndex ?? existingReading.newWaterIndex;
        const waterPrice = data.waterUnitPrice ?? existingReading.waterUnitPrice;

        if (data.oldWaterIndex !== undefined || data.newWaterIndex !== undefined || data.waterUnitPrice !== undefined) {
            updateData.waterUsed = newWater - oldWater;
            updateData.waterAmount = updateData.waterUsed * waterPrice;
        }

        const updatedMeterReading = await MeterReading.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate("roomId", "roomNumber");

        return updatedMeterReading;
    }

    async deleteMeterReading(id: string) {
        const result = await MeterReading.findByIdAndDelete(id);
        return result !== null;
    }

    async getMeterReadingForInvoice(roomId: string, month: number, year: number) {
        return await MeterReading.findOne({
            roomId,
            month,
            year
        });
    }
}

export const meterReadingService = new MeterReadingService();
