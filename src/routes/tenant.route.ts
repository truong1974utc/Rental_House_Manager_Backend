import { Router } from "express";
import { TenantController } from "../controllers/tenant.controller.js";

const router = Router();

router.get('/', TenantController.getAllTenants);

export default router;