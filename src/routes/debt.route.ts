import { Router } from "express";
import { DebtController } from "../controllers/debt.controller.js";

const router = Router();

router.get("/", DebtController.getDepositAndDebt);

export default router;
