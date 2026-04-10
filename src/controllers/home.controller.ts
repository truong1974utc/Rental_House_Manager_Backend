import { Request, Response } from "express";
import { HomeService } from "../services/home.service.js";

export const HomeController = {
  getOverview: async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const stats = await HomeService.getOverview(year);
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || "Failed to fetch home overview" });
    }
  }
};
