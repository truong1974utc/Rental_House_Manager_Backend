import mongoose from 'mongoose';
import process from 'process';

export const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('Please provide MONGO_URI in the environment variables');
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log("Connected DB:", mongoose.connection.name)
    } catch (error) {
        console.error(`❌ Error: ${error}`);
        process.exit(1);
    }
};