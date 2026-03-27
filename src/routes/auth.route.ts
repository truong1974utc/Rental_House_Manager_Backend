import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, refreshTokenSchema } from "../schemas/auth.schema.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", validate(loginSchema), AuthController.login);
router.post("/refresh-token", validate(refreshTokenSchema), AuthController.refreshToken);
router.get("/me", authMiddleware, AuthController.me);

export default router;
