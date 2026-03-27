import { Router } from "express";
import { TenantController } from "../controllers/tenant.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createTenantSchema, updateTenantSchema } from "../schemas/tenant.schema.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", validate(createTenantSchema), TenantController.createTenant);
router.get("/:id", authMiddleware, TenantController.getTenantById);
router.get("/", authMiddleware, TenantController.getAllTenants);
router.put("/:id", validate(updateTenantSchema), TenantController.updateTenant);
router.delete("/:id", TenantController.deleteTenant);

export default router;