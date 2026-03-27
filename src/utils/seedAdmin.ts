import mongoose from "mongoose";
import dotenv from "dotenv";
import { Tenant } from "../models/Tenant.js";
import { Room } from "../models/Room.js";
import bcrypt from "bcryptjs";
import { GENDER } from "../constants/enum.js";

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("Connected to MongoDB for seeding...");

        let room = await Room.findOne();
        if (!room) {
            room = await Room.create({
                roomNumber: "001",
                type: "Phòng đơn",
                price: 3000000,
                area: 25,
                maxPeople: 4,
                status: "AVAILABLE",
                description: "Phòng đơn",
            });
            console.log("Created a sample room");
        }

        const hashedPassword = await bcrypt.hash("123456", 10);

        await Tenant.deleteOne({ email: "admin@gmail.com" });

        const adminUser = await Tenant.create({
            roomId: room._id,
            fullName: "Admin",
            phone: "0123456789",
            idCard: "123456789012",
            email: "admin@gmail.com",
            address: "Hanoi",
            password: hashedPassword,
            birthDate: new Date("1990-01-01"),
            gender: GENDER.MALE,
            isRepresent: true
        });

        console.log("Seed admin user succeeded:", adminUser.email, "Password: 123456");

        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error);
        process.exit(1);
    }
};

seedDB();
