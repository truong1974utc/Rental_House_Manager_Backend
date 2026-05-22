import { Room } from "../models/Room.js";
import { Tenant } from "../models/Tenant.js";
import { IRoomQuery } from "../interfaces/Query.js";
import { CreateRoomInput, UpdateRoomInput } from "../schemas/room.schema.js";
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
        const room = await Room.findById(id).populate("representativeTenantId", "-password");
        if (!room) {
            throw new Error("Room not found");
        }
        const doc = room.toObject ? room.toObject() : room;
        const representative = doc.representativeTenantId || null;
        delete (doc as any).representativeTenantId;
        return { ...doc, representative };
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

        const allRooms = await Room.find(filter).populate("representativeTenantId", "-password").lean();
        const total = allRooms.length;

        const roomIds = allRooms.map(room => room._id);
        const tenants = await Tenant.find({ roomId: { $in: roomIds }, isDeleted: false }).select("_id roomId").lean();

        const allData = allRooms.map(room => {
            const roomTenants = tenants.filter(t => t.roomId?.toString() === room._id?.toString());
            const representative = room.representativeTenantId || null;
            const { representativeTenantId, ...rest } = room as any;
            
            return {
                ...rest,
                currentPeople: roomTenants.length,
                representative
            };
        }).sort((a, b) => (a.roomNumber || "").localeCompare(b.roomNumber || ""));

        // Phân trang sau khi sắp xếp
        const data = allData.slice(skip, skip + limit);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                count: data.length
            }
        }
    },
    getAvailableRooms: async () => {
        const rooms = await Room.find().populate("representativeTenantId", "-password").lean();
        
        const roomIds = rooms.map(room => room._id);
        const tenants = await Tenant.find({ roomId: { $in: roomIds }, isDeleted: false }).select("_id roomId").lean();

        const data = rooms
            .map(room => {
                const roomTenants = tenants.filter(t => t.roomId?.toString() === room._id?.toString());
                const representative = room.representativeTenantId || null;
                const { representativeTenantId, ...rest } = room as any;
                
                return {
                    ...rest,
                    currentPeople: roomTenants.length,
                    representative
                };
            })
            .filter(room => room.currentPeople < room.maxPeople)
            .sort((a, b) => (a.roomNumber || "").localeCompare(b.roomNumber || ""));

        return data;
    },
    updateRoom: async (id: string, roomData: UpdateRoomInput) => {
        const room = await Room.findByIdAndUpdate(id, roomData, { new: true, runValidators: true });
        return room;
    },
    deleteRoom: async (id: string) => {
        const room = await Room.findByIdAndDelete(id);
        return room;
    }
}
