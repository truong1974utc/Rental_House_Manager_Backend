import { Room, IRoom } from "../models/Room.js";
import { IRoomQuery } from "../interfaces/roomQuery.js";

export const RoomService = {
    createRoom: async (roomData: IRoom) => {
        const room = await Room.create(roomData);
        return room;
    },
    getRoomById: async (id: string) => {
        const room = await Room.findById(id);
        return room;
    },
    getAllRooms: async (query: IRoomQuery) => {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const filer: any = {};

        if (query.search) {
            filer.$or = [
                { roomNumber: { $regex: query.search, $options: "i" } },
                { type: { $regex: query.search, $options: "i" } },
                { description: { $regex: query.search, $options: "i" } }
            ]
        }

        const [rooms, total] = await Promise.all([
            Room.find(filer).skip(skip).limit(limit),
            Room.countDocuments(filer)
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