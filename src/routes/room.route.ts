import { Router } from "express";
import { RoomController } from "../controllers/room.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createRoomSchema, roomIdParamsSchema } from "../schemas/room.schema.js";

const router = Router();

router.post("/", validate(createRoomSchema), RoomController.createRoom);
router.get("/:id", validate(roomIdParamsSchema), RoomController.getRoomById);
router.get("/", RoomController.getAllRooms);
router.put("/:id", validate(roomIdParamsSchema), RoomController.updateRoom);
router.delete("/:id", validate(roomIdParamsSchema), RoomController.deleteRoom);

export default router;