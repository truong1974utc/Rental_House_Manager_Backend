const fs = require('fs');

const content = `import crypto from 'crypto';
import { Payment } from '../models/Payment.js';
import { Invoice } from '../models/Invoice.js';

// ====== CẤU HÌNH MOMO CÁ NHÂN ======
const personalMoMoConfig = {
    phone: process.env.MOMO_PHONE || '0354718501', 
    name: process.env.MOMO_NAME || 'NGUYEN QUANG TRUONG', 
    email: '' 
};

export const PaymentService = {
    createPaymentForInvoice: async (invoice: any) => {
        try {
            const orderId = \`HD_\${invoice.roomId}_\${invoice.month}\${invoice.year}\`;
            const amount = invoice.totalAmount;
            const orderInfo = \`Thanh toan HD \${invoice.month}/\${invoice.year}\`;

            const rawMoMoString = \`2|99|\${personalMoMoConfig.phone}|\${personalMoMoConfig.name}|\${personalMoMoConfig.email}|0|0|\${amount}|\${orderInfo}|transfer_myqr\`;

            const qrCodeUrl = \`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=\${encodeURIComponent(rawMoMoString)}\`;
            const payUrl = \`momo://app?action=payWithApp&is_deeplink=true&phone=\${personalMoMoConfig.phone}&amount=\${amount}&note=\${encodeURIComponent(orderInfo)}\`;

            const payment = await Payment.create({
                invoiceId: invoice._id,
                roomId: invoice.roomId,
                tenantId: invoice.tenantId,
                amount: invoice.totalAmount,
                paymentMethod: 'MOMO',
                status: 'PENDING',
                transactionId: orderId,
                payUrl: payUrl,
                qrCodeUrl: qrCodeUrl
            });

            return payment;
        } catch (error) {
            console.error('Lỗi tạo thanh toán MoMo:', error);
            const failedPayment = await Payment.create({
                invoiceId: invoice._id,
                roomId: invoice.roomId,
                tenantId: invoice.tenantId,
                amount: invoice.totalAmount,
                paymentMethod: 'MOMO',
                status: 'FAILED'
            });
            return failedPayment;
        }
    },

    handleMoMoIPN: async (body: any) => {
        return { status: 200, message: 'Bỏ qua IPN cũ' };
    },

    mockWebhookSuccess: async (invoiceId: string) => {
        const payment = await Payment.findOne({ invoiceId: invoiceId, status: 'PENDING' });
        if (!payment) return { status: 404, message: 'Payment not found or already paid' };

        payment.status = 'SUCCESS';
        payment.paymentDate = new Date();
        await payment.save();

        await Invoice.findByIdAndUpdate(invoiceId, {
            isPaid: true,
            paymentDate: new Date()
        });

        return { status: 200, message: 'Mock thanh toán thành công' };
    }
};`;

fs.writeFileSync('d:/DO AN/Rental_House_Manager_Backend/src/services/payment.service.ts', content, 'utf8');
console.log('Fix applied successfully!');