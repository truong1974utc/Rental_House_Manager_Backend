import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { Room } from './src/models/Room.js';
import { Service } from './src/models/Service.js';

dotenv.config();

async function run() {
    await connectDB();
    const rooms = await Room.find({});
    console.log("Rooms:", JSON.stringify(rooms.map(r => ({ id: r.id, number: r.roomNumber })), null, 2));

    const services = await Service.find({});
    console.log("Services:", JSON.stringify(services, null, 2));
    process.exit(0);
}

run();