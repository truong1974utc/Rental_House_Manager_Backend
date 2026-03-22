import { Room, IRoom } from "../models/Room.js";
import { IRoomQuery } from "../interfaces/Query.js";
import { CreateRoomInput } from "../schemas/room.schema.js";
import { AlreadyExistsError } from "../errors/alreadyExists.error.js";

export const RoomService = {
    createRoom: async (roomData: CreateRoomInput) => {
        const existingRoom = await Room.findOne({ roomNumber: roomData.roomNumber });
        if (existingRoom) {
            throw new AlreadyExistsError("Room already exists");
        }
        const room = await Room.create(roomData);
        return room;
    },
    getRoomById: async (id: string) => {
        const room = await Room.findById(id);
        if (!room) {
            throw new Error("Room not found");
        }
        return room;
    },
    getAllRooms: async (query: IRoomQuery) => {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter: any = {};

        if (query.search) {
            filter.$or = [
                { roomNumber: { $regex: query.search, $options: "i" } },
                { type: { $regex: query.search, $options: "i" } },
                { description: { $regex: query.search, $options: "i" } }
            ]
        }

        if (query.status) {
            filter.status = query.status;
        }

        if (query.type) {
            filter.type = query.type;
        }

        if (query.maxPeople) {
            filter.maxPeople = query.maxPeople;
        }

        const [rooms, total] = await Promise.all([
            Room.find(filter).skip(skip).limit(limit),
            Room.countDocuments(filter)
        ])
        return {
            data: rooms,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                count: rooms.length
            }
        }
    },
    updateRoom: async (id: string, roomData: IRoom) => {
        const room = await Room.findByIdAndUpdate(id, roomData, { new: true });
        return room;
    },
    deleteRoom: async (id: string) => {
        const room = await Room.findByIdAndDelete(id);
        return room;
    }
}