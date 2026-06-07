import express from 'express';
import cors from 'cors';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { connectDB } from './config/db.js';
import { errorHandler } from './middlewares/error.middleware.js';
import indexRoutes from './routes/index.route.js';
import { Message } from './models/Message.js';
import { Tenant } from './models/Tenant.js';
import { CHAT_ACCESS_DENIED_MESSAGE, hasChatAccess } from './utils/chatAccess.js';
import { JWT_SECRET } from './config/env.js';

connectDB();

const app = express();
const httpServer = createServer(app);
const isUploadedChatUrl = (value: string) => {
    if (!value) return false;
    try {
        const parsed = new URL(value);
        return parsed.pathname.startsWith("/uploads/chat/");
    } catch {
        return value.startsWith("/uploads/chat/");
    }
};
const io = new Server(httpServer, {
    cors: {
        origin: '*', // Adjust for production
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1 * 1024 * 1024
});

app.use(cors());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(express.json());

// Routes
app.use('/api', indexRoutes);

app.use(errorHandler);

// Store online users: { socketId: userId }
const onlineUsers = new Map<string, string>();

const getSocketToken = (socket: Socket) => {
    const authToken = socket.handshake.auth?.token;
    if (typeof authToken === "string" && authToken) {
        return authToken;
    }

    const authHeader = socket.handshake.headers.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
    }

    return "";
};

const getChatTenantFromSocket = async (socket: Socket) => {
    const token = getSocketToken(socket);
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id?: string };
        if (!decoded.id) return null;

        const tenant = await Tenant.findById(decoded.id);
        if (!tenant || tenant.isDeleted) return null;

        return tenant;
    } catch {
        return null;
    }
};

const emitChatAccessDenied = (socket: Socket) => {
    socket.emit("chatAccessDenied", { message: CHAT_ACCESS_DENIED_MESSAGE });
};

// Helper to broadcast online users
const emitOnlineUsers = async () => {
    try {
        const uniqueUserIds = Array.from(new Set(onlineUsers.values()));
        const users = await Tenant.find(
            { _id: { $in: uniqueUserIds } },
            'fullName role roomId'
        ).populate('roomId', 'roomNumber');
        
        io.to("general-chat").emit("onlineUsersList", users);
        io.to("general-chat").emit("onlineUsersCount", uniqueUserIds.length);
    } catch (err) {
        console.error('Error fetching online users:', err);
    }
};

// Socket.io connection handle
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join", async () => {
        const tenant = await getChatTenantFromSocket(socket);
        if (!tenant || !hasChatAccess(tenant)) {
            emitChatAccessDenied(socket);
            return;
        }

        socket.join("general-chat");
        socket.data.userId = tenant._id.toString();
        onlineUsers.set(socket.id, socket.data.userId);
        await emitOnlineUsers();
    });

    socket.on("sendMessage", async (data: any) => {
        try {
            const tenant = socket.data.userId
                ? await Tenant.findById(socket.data.userId)
                : await getChatTenantFromSocket(socket);

            if (!tenant || !hasChatAccess(tenant)) {
                emitChatAccessDenied(socket);
                return;
            }

            const { text, imageUrl, imageName, fileUrl, fileName, fileType, fileSize } = data || {};
            const normalizedText = typeof text === "string" ? text.trim() : "";
            const normalizedImageUrl = typeof imageUrl === "string" ? imageUrl : "";
            const normalizedImageName = typeof imageName === "string" ? imageName.slice(0, 120) : "";
            const normalizedFileUrl = typeof fileUrl === "string" ? fileUrl : "";
            const normalizedFileName = typeof fileName === "string" ? fileName.slice(0, 160) : "";
            const normalizedFileType = typeof fileType === "string" ? fileType.slice(0, 120) : "";
            const normalizedFileSize = typeof fileSize === "number" && Number.isFinite(fileSize) ? fileSize : 0;

            if (!normalizedText && !normalizedImageUrl && !normalizedFileUrl) return;

            if (
                normalizedImageUrl &&
                !isUploadedChatUrl(normalizedImageUrl)
            ) {
                socket.emit("messageError", { message: "Ảnh chưa được upload hợp lệ." });
                return;
            }

            if (
                normalizedFileUrl &&
                !isUploadedChatUrl(normalizedFileUrl)
            ) {
                socket.emit("messageError", { message: "File chưa được upload hợp lệ." });
                return;
            }

            const newMessage = new Message({
                sender: tenant._id,
                text: normalizedText,
                imageUrl: normalizedImageUrl,
                imageName: normalizedImageName,
                fileUrl: normalizedFileUrl,
                fileName: normalizedFileName,
                fileType: normalizedFileType,
                fileSize: normalizedFileSize
            });
            await newMessage.save();

            const populatedMessage = await Message.findById(newMessage._id).populate({
                path: 'sender',
                select: 'fullName username role roomId',
                populate: { path: 'roomId', select: 'roomNumber' }
            });
            io.to("general-chat").emit("receiveMessage", populatedMessage);
        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
        }
    });

    socket.on("disconnect", async () => {
        console.log("Client disconnected:", socket.id);
        if (onlineUsers.has(socket.id)) {
            onlineUsers.delete(socket.id);
            await emitOnlineUsers();
        }
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
