import crypto from "crypto";
import { Payment } from "../models/Payment.js";
import { Invoice } from "../models/Invoice.js";

interface MoMoConfig {
    partnerCode: string;
    accessKey: string;
    secretKey: string;
    endpoint: string;
    redirectUrl: string;
    ipnUrl: string;
}

const momoConfig: MoMoConfig = {
    partnerCode: process.env.MOMO_PARTNER_CODE || "MOMOBKUN20180529",
    accessKey: process.env.MOMO_ACCESS_KEY || "klm05TvNCzjOaHU1",
    secretKey: process.env.MOMO_SECRET_KEY || "at67qH6mk8g5HI18mI8i6Piw240Gl1Y1",
    endpoint: process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create",
    redirectUrl: process.env.MOMO_REDIRECT_URL || "http://localhost:5173/thanh-toan",
    ipnUrl: process.env.MOMO_IPN_URL || "https://your-ngrok-url.com/api/payment/momo-ipn",
};

export const PaymentService = {
    createPaymentForInvoice: async (invoice: any) => {
        try {
            const orderId = `${momoConfig.partnerCode}_${Date.now()}`;
            const requestId = orderId;
            const amount = invoice.totalAmount;
            const orderInfo = `Thanh toán hóa đơn tháng ${invoice.month}/${invoice.year}`;
            
            // Build signature
            const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=&ipnUrl=${momoConfig.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.redirectUrl}&requestId=${requestId}&requestType=captureWallet`;
            const signature = crypto.createHmac("sha256", momoConfig.secretKey).update(rawSignature).digest("hex");

            const requestBody = {
                partnerCode: momoConfig.partnerCode,
                partnerName: "Test",
                storeId: "MomoTestStore",
                requestId: requestId,
                amount: amount,
                orderId: orderId,
                orderInfo: orderInfo,
                redirectUrl: momoConfig.redirectUrl,
                ipnUrl: momoConfig.ipnUrl,
                lang: "vi",
                requestType: "captureWallet",
                autoCapture: true,
                extraData: "",
                signature: signature
            };

            const response = await fetch(momoConfig.endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            
            // Create payment record
            const payment = await Payment.create({
                invoiceId: invoice._id,
                roomId: invoice.roomId,
                tenantId: invoice.tenantId,
                amount: invoice.totalAmount,
                paymentMethod: "MOMO",
                status: "PENDING",
                transactionId: orderId,
                payUrl: result.payUrl || null
            });
            
            return payment;
        } catch (error) {
            console.error("Lỗi tạo thanh toán MoMo:", error);
            // Vẫn tạo bản ghi payment thất bại
            const failedPayment = await Payment.create({
                invoiceId: invoice._id,
                roomId: invoice.roomId,
                tenantId: invoice.tenantId,
                amount: invoice.totalAmount,
                paymentMethod: "MOMO",
                status: "FAILED"
            });
            return failedPayment;
        }
    },
    
    handleMoMoIPN: async (body: any) => {
        const { orderId, resultCode, signature, ...rest } = body;
        
        // Find payment
        const payment = await Payment.findOne({ transactionId: orderId });
        if (!payment) return { status: 404, message: "Transaction not found" };

        if (payment.status === "SUCCESS") {
            return { status: 200, message: "Already processed" };
        }

        if (resultCode === 0) {
            // Success
            payment.status = "SUCCESS";
            payment.paymentDate = new Date();
            await payment.save();

            // Update Invoice
            await Invoice.findByIdAndUpdate(payment.invoiceId, {
                isPaid: true,
                paymentDate: new Date()
            });

            return { status: 200, message: "Success" };
        } else {
            // Failed
            payment.status = "FAILED";
            await payment.save();
            return { status: 200, message: "Transaction failed" };
        }
    }
}