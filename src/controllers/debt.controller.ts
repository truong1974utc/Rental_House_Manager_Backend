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

    const result = [];

    for (let contract of contracts) {
      const roomId = contract.roomId?._id || contract.roomId;
      const tenantId = contract.representativeTenantId?._id || contract.representativeTenantId;

      const roomNumber = (contract.roomId as any)?.roomNumber || "N/A";
      const tenantName = (contract.representativeTenantId as any)?.fullName || "N/A";

      // Lấy danh sách hóa đơn chưa thanh toán của phòng này
      const unpaidInvoices = await Invoice.find({
        roomId: roomId,
        isPaid: false
      }).sort({ createdAt: -1 });

      const debts = unpaidInvoices.map((inv) => ({
        id: inv._id,
        invoiceCode: `HD-${inv.month}-${inv.year}-${inv.roomId.toString().substring(0, 4)}`,
        period: `${inv.month}/${inv.year}`,
        amount: inv.totalAmount,
        paid: 0, // Yêu cầu không có thanh toán 1 phần, nên nếu false thì đã trả 0đ
        status: "unpaid"
      }));

      // Nếu có nợ tiền thì cũng cho vào danh sách tổng hợp công nợ (hoặc show hết phụ thuộc UI cần)
      result.push({
        id: contract._id.toString(), // Sử dụng contract._id làm id duy nhất thay vì tenantId để tránh trùng lặp khi 1 người mướn nhiều phòng
        name: tenantName,
        roomNumber: roomNumber,
        deposit: {
          amount: contract.deposit,
          date: contract.startDate,
          status: "held"
        },
        debts: debts
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin cọc/công nợ thành công",
      data: result
    });
  })
};
