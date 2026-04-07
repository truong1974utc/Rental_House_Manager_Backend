import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { errorHandler } from './middlewares/error.middleware.js';
import indexRoutes from './routes/index.route.js';
import { Message } from './models/Message.js';
import { Tenant } from './models/Tenant.js';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*', // Adjust for production
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', indexRoutes);

app.use(errorHandler);

// Store online users: { socketId: userId }
const onlineUsers = new Map();

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

    socket.on("join", async (userId) => {
        socket.join("general-chat");
        if (userId) {
            onlineUsers.set(socket.id, userId);
            await emitOnlineUsers();
        }
    });

    socket.on("sendMessage", async (data) => {
        try {
            const { text, sender } = data;
            if (!text || !sender) return;

            const newMessage = new Message({
                sender,
                text
            });
            await newMessage.save();

            const populatedMessage = await Message.findById(newMessage._id).populate({
                path: 'sender',
                select: 'fullName username role',
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