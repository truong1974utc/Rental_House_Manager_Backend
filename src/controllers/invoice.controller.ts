import { InvoiceService } from "../services/invoice.service.js";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CreateInvoiceInput, UpdateInvoiceInput } from "../schemas/invoice.schema.js";
import { IInvoiceQuery } from "../interfaces/Query.js";

export const InvoiceController = {
    createInvoice: asyncHandler(async (req: Request<{}, {}, CreateInvoiceInput>, res: Response) => {
        const invoice = await InvoiceService.createInvoice(req.body);
        res.status(201).json({
            success: true,
            message: "Create invoice successfully",
            data: invoice
        });
    }),
    getInvoiceById: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const invoice = await InvoiceService.getInvoiceById(req.params.id);
        res.status(200).json({
            success: true,
            message: "Get invoice successfully",
            data: invoice
        });
    }),
    getAllInvoices: asyncHandler(async (req: Request, res: Response) => {
        const query: IInvoiceQuery = req.query;
        const result = await InvoiceService.getAllInvoices(query);
        res.status(200).json({
            success: true,
            message: "Get all invoices successfully",
            data: result.data,
            meta: result.meta
        });
    }),
    updateInvoice: asyncHandler(async (req: Request<{ id: string }, {}, UpdateInvoiceInput>, res: Response) => {
        const invoice = await InvoiceService.updateInvoice(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Update invoice successfully",
            data: invoice
        });
    }),
    deleteInvoice: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const invoice = await InvoiceService.deleteInvoice(req.params.id);
        res.status(200).json({
            success: true,
            message: "Delete invoice successfully",
            data: invoice
        });
    })
}