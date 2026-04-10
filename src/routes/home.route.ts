import { Router } from "express";
import { HomeController } from "../controllers/home.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/overview", authMiddleware, HomeController.getOverview);

export default router;
