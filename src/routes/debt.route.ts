import { Router } from "express";
import { DebtController } from "../controllers/debt.controller.js";

const router = Router();

router.get("/", DebtController.getDepositAndDebt);
router.patch("/:roomId/deposit/confirm", DebtController.confirmDepositReceipt);

export default router;
