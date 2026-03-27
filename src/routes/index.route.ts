import { Router } from "express";
import roomRoutes from "./room.route.js";
import tenantRoutes from "./tenant.route.js";
import contractRoutes from "./contract.route.js";
import serviceRoutes from "./service.route.js";
import invoiceRoutes from "./invoice.route.js";
import authRoutes from "./auth.route.js";

const router = Router();

router.use('/rooms', roomRoutes);
router.use('/tenants', tenantRoutes);
router.use('/contracts', contractRoutes);
router.use('/services', serviceRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/auth', authRoutes);

export default router;