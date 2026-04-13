import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PaymentService } from "../services/payment.service.js";
import { Payment } from "../models/Payment.js";

export const PaymentController = {
    handleMoMoIPN: asyncHandler(async (req: Request, res: Response) => {
        const result = await PaymentService.handleMoMoIPN(req.body);
        if (result.status === 200) {
            res.status(200).json({ message: result.message });
        } else {
            res.status(result.status).json({ message: result.message });
        }
    }),

    getPaymentsByInvoiceId: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const payments = await Payment.find({ invoiceId: id }).sort({ createdAt: -1 });
        res.status(200).json(payments);
    }),

    mockWebhookSuccess: asyncHandler(async (req: Request, res: Response) => {
        const { invoiceId } = req.body;
        const result = await PaymentService.mockWebhookSuccess(invoiceId);
        res.status(result.status).json({ message: result.message });
    })
};
