import { Router } from "express";
import { ContractController } from "../controllers/contract.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createContractSchema, updateContractSchema } from "../schemas/contract.schema.js";

const router = Router();

router.post("/", validate(createContractSchema), ContractController.createContract);
router.get("/", ContractController.getAllContracts);
router.get("/:id", ContractController.getContractById);
router.put("/:id", validate(updateContractSchema), ContractController.updateContract);
router.delete("/:id", ContractController.deleteContract);

export default router;