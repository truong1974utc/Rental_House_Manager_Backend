import express from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Webhook từ MoMo, không cần xác thực
router.post("/momo-ipn", PaymentController.handleMoMoIPN);

// Lấy lịch sử payment theo hoá đơn
router.get("/invoice/:id", authMiddleware, PaymentController.getPaymentsByInvoiceId);

export default router;
