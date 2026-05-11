import crypto from 'crypto';
import { Payment } from '../models/Payment.js';
import { Invoice } from '../models/Invoice.js';

export const PaymentService = {
    createPaymentForInvoice: async (invoice: any) => {
        try {
            // Cập nhật cấu hình ngay trong hàm để lấy được process.env sau khi dotenv.config() chạy
            const vietQrConfig = {
                bankId: process.env.VIETQR_BANK_ID || 'MB', 
                accountNo: process.env.VIETQR_ACCOUNT_NO || '', 
                accountName: process.env.VIETQR_ACCOUNT_NAME || ''
            };

            const orderId = `HD_${invoice._id.toString().slice(-6)}`;
            const amount = invoice.totalAmount;
            const orderInfo = `Thanh toan ${orderId}`;

            const qrCodeUrl = `https://img.vietqr.io/image/${vietQrConfig.bankId}-${vietQrConfig.accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(orderInfo)}&accountName=${encodeURIComponent(vietQrConfig.accountName || '')}`;
            const payUrl = qrCodeUrl;

            const payment = await Payment.create({
                invoiceId: invoice._id,
                roomId: invoice.roomId,
                tenantId: invoice.tenantId,
                amount: invoice.totalAmount,
                paymentMethod: 'TRANSFER',
                status: 'PENDING',
                transactionId: orderId,
                payUrl: payUrl,
                qrCodeUrl: qrCodeUrl
            });

            return payment;
        } catch (error) {
            console.error('Lỗi tạo thanh toán VietQR:', error);
            const failedPayment = await Payment.create({
                invoiceId: invoice._id,
                roomId: invoice.roomId,
                tenantId: invoice.tenantId,
                amount: invoice.totalAmount,
                paymentMethod: 'TRANSFER',
                status: 'FAILED'
            });
            return failedPayment;
        }
    },

    mockWebhookSuccess: async (invoiceId: string) => {
        const payment = await Payment.findOne({ invoiceId: invoiceId, status: 'PENDING' });
        if (!payment) return { status: 404, message: 'Payment not found or already paid' };

        payment.status = 'SUCCESS';
        payment.paymentDate = new Date();
        await payment.save();

        const updatedInvoice = await Invoice.findByIdAndUpdate(invoiceId, {
            isPaid: true,
            paymentDate: new Date()
        });

        // Nếu đây là hóa đơn tiền cọc thì cập nhật trạng thái cọc của hợp đồng thành "held"
        if (updatedInvoice && updatedInvoice.type === "DEPOSIT") {
            const { Contract } = await import('../models/Contract.js');
            await Contract.findOneAndUpdate(
                { roomId: updatedInvoice.roomId, representativeTenantId: updatedInvoice.tenantId, depositStatus: "unpaid" },
                { depositStatus: "held" },
                { sort: { createdAt: -1 } }
            );
        }

        return { status: 200, message: 'Mock thanh toán thành công' };
    }
};