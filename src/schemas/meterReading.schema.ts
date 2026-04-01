import { z } from "zod";
import { METER_READING_STATUS } from "../constants/enum.js";

export const meterReadingSchema = z.object({
  body: z.object({
    roomId: z.string().min(1, "Room ID is required"),
    month: z.number().min(1).max(12),
    year: z.number().min(2000),
    oldElectricIndex: z.number().min(0),
    newElectricIndex: z.number().min(0),
    electricUnitPrice: z.number().min(0),
    oldWaterIndex: z.number().min(0),
    newWaterIndex: z.number().min(0),
    waterUnitPrice: z.number().min(0),
    status: z.nativeEnum(METER_READING_STATUS).optional(),
    recordedAt: z.string().optional(),
    note: z.string().optional(),
  }).refine((data) => data.newElectricIndex >= data.oldElectricIndex, {
    message: "New electric index must be greater than or equal to old electric index",
    path: ["newElectricIndex"],
  }).refine((data) => data.newWaterIndex >= data.oldWaterIndex, {
    message: "New water index must be greater than or equal to old water index",
    path: ["newWaterIndex"],
  })
});

export const updateMeterReadingSchema = z.object({
  body: z.object({
    roomId: z.string().optional(),
    month: z.number().min(1).max(12).optional(),
    year: z.number().min(2000).optional(),
    oldElectricIndex: z.number().min(0).optional(),
    newElectricIndex: z.number().min(0).optional(),
    electricUnitPrice: z.number().min(0).optional(),
    oldWaterIndex: z.number().min(0).optional(),
    newWaterIndex: z.number().min(0).optional(),
    waterUnitPrice: z.number().min(0).optional(),
    status: z.nativeEnum(METER_READING_STATUS).optional(),
    recordedAt: z.string().optional(),
    note: z.string().optional(),
  }).refine((data) => {
    if (data.newElectricIndex !== undefined && data.oldElectricIndex !== undefined) {
      return data.newElectricIndex >= data.oldElectricIndex;
    }
    return true; // We can't fully validate cross-fields if only one is updated here without db context, but let's do basic
  }, {
    message: "New electric index must be greater than or equal to old electric index",
    path: ["newElectricIndex"],
  }).refine((data) => {
    if (data.newWaterIndex !== undefined && data.oldWaterIndex !== undefined) {
      return data.newWaterIndex >= data.oldWaterIndex;
    }
    return true;
  }, {
    message: "New water index must be greater than or equal to old water index",
    path: ["newWaterIndex"],
  })
});

export type CreateMeterReadingInput = z.infer<typeof meterReadingSchema>["body"];
export type UpdateMeterReadingInput = z.infer<typeof updateMeterReadingSchema>["body"];
