import { Router } from "express";
import { ReportController } from "../controllers/report.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/dashboard", authMiddleware, ReportController.getDashboardStats);

export default router;
