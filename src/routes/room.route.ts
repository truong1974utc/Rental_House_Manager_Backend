import { Router } from "express";
import { RoomController } from "../controllers/room.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createRoomSchema, updateRoomSchema } from "../schemas/room.schema.js";

const router = Router();

router.post("/", validate(createRoomSchema), RoomController.createRoom);
router.get("/:id", RoomController.getRoomById);
router.get("/", RoomController.getAllRooms);
router.put("/:id", validate(updateRoomSchema), RoomController.updateRoom);
router.delete("/:id", RoomController.deleteRoom);

export default router;