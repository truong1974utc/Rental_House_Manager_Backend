import { Router } from "express";
import { meterReadingController } from "../controllers/meterReading.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { meterReadingSchema, updateMeterReadingSchema } from "../schemas/meterReading.schema.js";

const router = Router();

router.get("/for-invoice", meterReadingController.getForInvoice);
router.post("/", validate(meterReadingSchema), meterReadingController.createMeterReading);
router.get("/", meterReadingController.getMeterReadings);
router.get("/:id", meterReadingController.getMeterReadingById);
router.put("/:id", validate(updateMeterReadingSchema), meterReadingController.updateMeterReading);
router.delete("/:id", meterReadingController.deleteMeterReading);

export default router;
