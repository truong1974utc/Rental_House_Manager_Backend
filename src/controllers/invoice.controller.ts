import { asyncHandler } from "../utils/asyncHandler.js";
import { IInvoiceQuery } from "../interfaces/Query.js";
import { InvoiceService } from "../services/invoice.service.js";
import { Request, Response } from "express";

export const InvoiceController = {
    getAllInvoices: asyncHandler(async (req: Request, res: Response) => {
        const query: IInvoiceQuery = req.query;
        const result = await InvoiceService.getAllInvoices(query);
        res.status(200).json(result);
    })
}