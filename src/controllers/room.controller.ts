import { RoomService } from "../services/room.service.js";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CreateRoomInput, RoomIdParamsInput } from "../schemas/room.schema.js";

export const RoomController = {
    createRoom: asyncHandler(async (req: Request<CreateRoomInput>, res: Response) => {
        const room = await RoomService.createRoom(req.body);
        res.status(201).json(room);
    }),
    getRoomById: asyncHandler(async (req: Request<RoomIdParamsInput>, res: Response) => {
        const room = await RoomService.getRoomById(req.params.id);
        res.status(200).json(room);
    }),
    getAllRooms: asyncHandler(async (req: Request, res: Response) => {
        const query = {
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
            search: req.query.search as string | undefined
        }
        const result = await RoomService.getAllRooms(query);
        res.status(200).json(result);
    }),
    updateRoom: asyncHandler(async (req: Request<RoomIdParamsInput, CreateRoomInput>, res: Response) => {
        const room = await RoomService.updateRoom(req.params.id, req.body);
        res.status(200).json(room);
    }),
    deleteRoom: asyncHandler(async (req: Request<RoomIdParamsInput>, res: Response) => {
        const room = await RoomService.deleteRoom(req.params.id);
        res.status(200).json(room);
    })
}
