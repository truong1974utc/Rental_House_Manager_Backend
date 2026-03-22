import { Router } from "express";
import { TenantController } from "../controllers/tenant.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createTenantSchema, updateTenantSchema } from "../schemas/tenant.schema.js";

const router = Router();

router.post("/", validate(createTenantSchema), TenantController.createTenant);
router.get("/:id", TenantController.getTenantById);
router.get("/", TenantController.getAllTenants);
router.put("/:id", validate(updateTenantSchema), TenantController.updateTenant);
router.delete("/:id", TenantController.deleteTenant);

export default router;