import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller.js";

const router = Router();

router.get("/", InvoiceController.getAllInvoices);

export default router;
