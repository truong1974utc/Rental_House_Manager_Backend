import { Room } from "../models/Room.js";
import { Tenant } from "../models/Tenant.js";
import { Invoice } from "../models/Invoice.js";
import { Contract } from "../models/Contract.js";

export const HomeService = {
  getOverview: async (year: number) => {
    const totalRooms = await Room.countDocuments();
    const occupied = await Room.countDocuments({ status: "OCCUPIED" });
    const available = await Room.countDocuments({ status: "AVAILABLE" });
    const maintenance = await Room.countDocuments({ status: "REPAIRING" });
    
    const occupancyRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;
    
    const activeTenants = await Tenant.countDocuments({ isActive: true, role: "tenant" }); 
    // Fallback to all tenants if isActive isn't used correctly. Let's just use all tenants for now
    const totalTenants = await Tenant.countDocuments({ role: "tenant" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeContracts = await Contract.countDocuments({ 
        status: "ACTIVE",
        endDate: { $gte: today } 
    });

    const invoices = await Invoice.find({ year }).lean();
    
    const unpaidInvoices = invoices.filter((inv: any) => !inv.isPaid);
    const paidInvoices = invoices.filter((inv: any) => inv.isPaid);
    
    const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const unpaidCount = unpaidInvoices.length;

    const monthlyMap: Record<number, { revenue: number; unpaid: number }> = {};
    for (let m = 1; m <= 12; m++) {
        monthlyMap[m] = { revenue: 0, unpaid: 0 };
    }
    
    invoices.forEach((inv: any) => {
        const month = inv.month || new Date(inv.createdAt!).getMonth() + 1;
        if (month >= 1 && month <= 12) {
            if (inv.isPaid) monthlyMap[month].revenue += inv.totalAmount || 0;
            else monthlyMap[month].unpaid += inv.totalAmount || 0;
        }
    });
    
    const monthlyChart = Object.entries(monthlyMap).map(([m, d]) => ({
        month: `T${m}`,
        revenue: d.revenue,
        unpaid: d.unpaid
    }));

    const pieColors = [
      "hsl(160 45% 40%)",
      "hsl(35 80% 55%)",
      "hsl(0 65% 55%)",
      "hsl(200 60% 50%)",
    ];
    
    const roomStatusData = [
      { name: "Đang thuê", value: occupied, fill: pieColors[0] },
      { name: "Trống", value: available, fill: pieColors[1] },
      { name: "Bảo trì", value: maintenance, fill: pieColors[2] },
    ].filter(d => d.value > 0);

    const recentInvoices = await Invoice.find({ year })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("roomId", "roomNumber")
      .populate("tenantId", "fullName")
      .lean();

    const formattedRecentInvoices = recentInvoices.map((inv: any) => ({
      _id: inv._id,
      roomNumber: inv.roomId ? inv.roomId.roomNumber : "N/A",
      tenantName: inv.tenantId ? inv.tenantId.fullName : "N/A",
      totalAmount: inv.totalAmount || 0,
      isPaid: inv.isPaid,
      month: inv.month,
      year: inv.year,
      createdAt: inv.createdAt
    }));

    return {
        totalRooms,
        occupied,
        occupancyRate,
        activeTenants: totalTenants,
        unpaidCount,
        totalUnpaid,
        totalRevenue,
        roomStatusData,
        monthlyChart,
        activeContracts,
        recentInvoices: formattedRecentInvoices
    };
  }
};
