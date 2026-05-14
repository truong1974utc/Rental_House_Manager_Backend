import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createInvoiceSchema, updateInvoiceSchema } from "../schemas/invoice.schema.js";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", validate(createInvoiceSchema), InvoiceController.createInvoice);
router.post("/:id/resend-notification", authMiddleware, authorizeRoles("manager", "ADMIN", "admin"), InvoiceController.resendInvoiceNotification);
router.get("/:id", InvoiceController.getInvoiceById);
router.get("/", InvoiceController.getAllInvoices);
router.put("/:id", validate(updateInvoiceSchema), InvoiceController.updateInvoice);
router.delete("/:id", InvoiceController.deleteInvoice);

export default router;
