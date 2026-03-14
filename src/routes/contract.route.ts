import { Router } from "express";
import { ContractController } from "../controllers/contract.controller.js";

const router = Router();

router.get("/", ContractController.getAllContracts);

export default router;