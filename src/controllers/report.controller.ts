import { Request, Response } from "express";
import { ReportService } from "../services/report.service.js";

export const ReportController = {
  getDashboardStats: async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);

      const stats = await ReportService.getDashboardStats(year, month);
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to fetch report stats" });
    }
  }
};
