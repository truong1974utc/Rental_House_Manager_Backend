import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Contract } from "../models/Contract.js";
import { Invoice } from "../models/Invoice.js";

import { STATUS } from "../constants/enum.js";

export const DebtController = {
  getDepositAndDebt: asyncHandler(async (req: Request, res: Response) => {
    // Lấy tất cả hợp đồng đang ACTIVE (hoặc Hoạt động do dữ liệu cũ) để xác định tiền cọc và thông tin người thuê
    const contracts = await Contract.find({ status: { $in: [STATUS.ACTIVE, "Hoạt động", "ACTIVE", "active", "hoạt động"] } })
      .populate("roomId", "roomNumber")
      .populate("representativeTenantId", "fullName");

    const roomMap = new Map();

    for (let contract of contracts) {
      const roomIdStr = contract.roomId?._id?.toString() || contract.roomId?.toString();
      const tenantIdStr = contract.representativeTenantId?._id?.toString() || contract.representativeTenantId?.toString();

      const roomNumber = (contract.roomId as any)?.roomNumber || "N/A";
      const tenantName = (contract.representativeTenantId as any)?.fullName || "N/A";

      if (!roomMap.has(roomIdStr)) {
        roomMap.set(roomIdStr, {
          id: roomIdStr, // Sử dụng roomId làm id duy nhất để người thuê 1 phòng chỉ hiện 1 lần
          name: tenantName,
          roomNumber: roomNumber,
          deposit: {
            amount: 0,
            date: contract.startDate,
            status: "held"
          },
          debts: []
        });
      }

      const roomData = roomMap.get(roomIdStr);
      // Cộng dồn tiền cọc nếu có nhiều hợp đồng cho 1 phòng
      roomData.deposit.amount += (contract.deposit || 0);

      // Nếu có tên người khác thì nối thêm vào hiển thị ("Nguyễn Văn A & Nguyễn Văn B")
      if (tenantName !== "N/A" && !roomData.name.includes(tenantName)) {
        roomData.name += ` & ${tenantName}`;
      }
    }

    const result = [];

    // Lấy hóa đơn chưa thanh toán cho các phòng đã được gộp
    for (let [roomId, roomData] of roomMap.entries()) {
      const unpaidInvoices = await Invoice.find({
        roomId: roomId,
        isPaid: false
      }).sort({ createdAt: -1 });

      roomData.debts = unpaidInvoices.map((inv) => ({
        id: inv._id,
        invoiceCode: `HD-${inv.month}-${inv.year}-${inv.roomId.toString().substring(0, 4)}`,
        period: `${inv.month}/${inv.year}`,
        amount: inv.totalAmount,
        paid: 0, // Yêu cầu không có thanh toán 1 phần, nên nếu false thì đã trả 0đ
        status: "unpaid"
      }));

      result.push(roomData);
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin cọc/công nợ thành công",
      data: result
    });
  })
};
