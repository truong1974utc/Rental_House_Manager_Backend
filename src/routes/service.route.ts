import { Router } from "express";
import { ServiceController } from "../controllers/service.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createServiceSchema, updateServiceSchema } from "../schemas/service.schema.js";

const router = Router();

router.post("/", validate(createServiceSchema), ServiceController.createService);
router.get("/:id", ServiceController.getServiceById);
router.get("/", ServiceController.getAllServices);
router.put("/:id", validate(updateServiceSchema), ServiceController.updateService);
router.delete("/:id", ServiceController.deleteService);

export default router;
