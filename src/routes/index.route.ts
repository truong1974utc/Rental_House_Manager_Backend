import { Router } from "express";
import roomRoutes from "./room.route.js";
import tenantRoutes from "./tenant.route.js";
import contractRoutes from "./contract.route.js";
import serviceRoutes from "./service.route.js";
import invoiceRoutes from "./invoice.route.js";
import authRoutes from "./auth.route.js";
import meterReadingRoutes from "./meterReading.route.js";
import paymentRoutes from "./payment.route.js";
import debtRoutes from "./debt.route.js";
import messageRoutes from "./message.route.js";
import reportRoutes from "./report.route.js";
import homeRoutes from "./home.route.js";

const router = Router();

router.use('/rooms', roomRoutes);
router.use('/tenants', tenantRoutes);
router.use('/contracts', contractRoutes);
router.use('/services', serviceRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/auth', authRoutes);
router.use('/meter-readings', meterReadingRoutes);
router.use('/payments', paymentRoutes);
router.use('/debts', debtRoutes);
router.use('/messages', messageRoutes);
router.use('/reports', reportRoutes);
router.use('/home', homeRoutes);

export default router;