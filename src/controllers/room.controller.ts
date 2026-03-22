import { RoomService } from "../services/room.service.js";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CreateRoomInput } from "../schemas/room.schema.js";
import { IRoomQuery } from "../interfaces/Query.js";

export const RoomController = {
    createRoom: asyncHandler(async (req: Request<CreateRoomInput>, res: Response) => {
        const room = await RoomService.createRoom(req.body);
        res.status(201).json({
            success: true,
            message: "Create room successfully",
            data: room
        });
    }),
    getRoomById: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const room = await RoomService.getRoomById(req.params.id);
        res.status(200).json({
            success: true,
            message: "Get room successfully",
            data: room
        });
    }),
    getAllRooms: asyncHandler(async (req: Request, res: Response) => {
        const query: IRoomQuery = req.query;
        const result = await RoomService.getAllRooms(query);
        res.status(200).json({
            success: true,
            message: "Get all rooms successfully",
            data: result.data,
            meta: result.meta
        });
    }),
    updateRoom: asyncHandler(async (req: Request<{ id: string }, CreateRoomInput>, res: Response) => {
        const room = await RoomService.updateRoom(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Update room successfully",
            data: room
        });
    }),
    deleteRoom: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
        const room = await RoomService.deleteRoom(req.params.id);
        res.status(200).json({
            success: true,
            message: "Delete room successfully",
            data: room
        });
    })
}
