import express from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Lấy lịch sử payment theo hoá đơn
router.get("/invoice/:id", authMiddleware, PaymentController.getPaymentsByInvoiceId);

export default router;

router.post('/mock-webhook', PaymentController.mockWebhookSuccess);
