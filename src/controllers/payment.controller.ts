import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PaymentService } from "../services/payment.service.js";
import { Payment } from "../models/Payment.js";

export const PaymentController = {
    getPaymentsByInvoiceId: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        let payments = await Payment.find({ invoiceId: id }).sort({ createdAt: -1 });

        // Tự động cập nhật lại các QR cũ đang PENDING sang VietQR với cấu hình mới
        for (let p of payments) {
            if (p.status === 'PENDING') {
                const vietQrConfig = {
                    bankId: process.env.VIETQR_BANK_ID || 'MB',
                    accountNo: process.env.VIETQR_ACCOUNT_NO || '',
                    accountName: process.env.VIETQR_ACCOUNT_NAME || ''
                };
                
                const amount = p.amount;
                let orderInfo = p.transactionId || `HD_${p.invoiceId.toString().slice(-6)}`;
                // Nếu transactionId cũ có chữ MOMO, ghi đè lại bằng mã mới để QR code không chứa chữ MOMO
                if (orderInfo.includes('MOMO')) {
                    orderInfo = `HD_${p.invoiceId.toString().slice(-6)}`;
                    p.transactionId = orderInfo;
                }
                const qrCodeUrl = `https://img.vietqr.io/image/${vietQrConfig.bankId}-${vietQrConfig.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(orderInfo)}&accountName=${encodeURIComponent(vietQrConfig.accountName)}`;
                
                if (p.qrCodeUrl !== qrCodeUrl || p.paymentMethod !== 'TRANSFER') {
                    p.paymentMethod = 'TRANSFER';
                    p.qrCodeUrl = qrCodeUrl;
                    p.payUrl = qrCodeUrl;
                    await p.save();
                }
            }
        }

        res.status(200).json(payments);
    }),

    mockWebhookSuccess: asyncHandler(async (req: Request, res: Response) => {
        const { invoiceId } = req.body;
        const result = await PaymentService.mockWebhookSuccess(invoiceId);
        res.status(result.status).json({ message: result.message });
    })
};
