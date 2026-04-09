import { Invoice } from "../models/Invoice.js";
import { Room } from "../models/Room.js";
import { Contract } from "../models/Contract.js";

export const ReportService = {
  getDashboardStats: async (year: number, month: number) => {
    const monthStatsAgg = await Invoice.aggregate([
      { $match: { month, year } },
      {
        $group: {
          _id: null,
          monthRevenue: { $sum: { $cond: [{ $eq: ["$isPaid", true] }, "$totalAmount", 0] } },
          monthUnpaid: { $sum: { $cond: [{ $eq: ["$isPaid", false] }, "$totalAmount", 0] } },
          monthTotal: { $sum: "$totalAmount" },
          paidCount: { $sum: { $cond: [{ $eq: ["$isPaid", true] }, 1, 0] } },
          unpaidCount: { $sum: { $cond: [{ $eq: ["$isPaid", false] }, 1, 0] } }
        }
      }
    ]);

    const monthStatsDict = monthStatsAgg[0] || { monthRevenue: 0, monthUnpaid: 0, monthTotal: 0, paidCount: 0, unpaidCount: 0 };

    const yearStatsAgg = await Invoice.aggregate([
      { $match: { year } },
      {
        $group: {
          _id: "$month",
          revenue: { $sum: { $cond: [{ $eq: ["$isPaid", true] }, "$totalAmount", 0] } },
          unpaid: { $sum: { $cond: [{ $eq: ["$isPaid", false] }, "$totalAmount", 0] } }
        }
      }
    ]);

    const monthlyChart = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const mData = yearStatsAgg.find((d: any) => d._id === m) || { revenue: 0, unpaid: 0 };
      return {
        month: `T${m}`,
        revenue: mData.revenue,
        unpaid: mData.unpaid
      };
    });

    const roomPieAgg = await Invoice.aggregate([
      { $match: { month, year } },
      {
        $lookup: { from: "rooms", localField: "roomId", foreignField: "_id", as: "room" }
      },
      { $unwind: { path: "$room", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$room.roomNumber",
          value: { $sum: "$totalAmount" }
        }
      },
      { $sort: { value: -1 } },
      { $limit: 5 }
    ]);

    const roomPieData = roomPieAgg.map((r: any) => ({
      name: r._id ? `P.${r._id}` : "Khác",
      value: r.value
    }));

    const roomDetailRaw = await Invoice.find({ month, year })
      .populate("roomId", "roomNumber")
      .populate("tenantId", "fullName")
      .lean();

    const roomDetail = roomDetailRaw.map((inv: any) => ({
      id: inv._id,
      room: inv.roomId ? inv.roomId.roomNumber : "N/A",
      tenant: inv.tenantId ? inv.tenantId.fullName : "N/A",
      amount: inv.totalAmount || 0,
      isPaid: inv.isPaid,
      month: inv.month,
      year: inv.year
    }));

    const occupiedRooms = await Room.countDocuments({ status: "OCCUPIED" });
    const totalRooms = await Room.countDocuments();
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return {
      monthRevenue: monthStatsDict.monthRevenue,
      monthUnpaid: monthStatsDict.monthUnpaid,
      monthTotal: monthStatsDict.monthTotal,
      paidCount: monthStatsDict.paidCount,
      unpaidCount: monthStatsDict.unpaidCount,
      monthlyChart,
      roomPieData,
      roomDetail,
      occupancyRate,
      occupiedRooms,
      totalRooms
    };
  }
};
