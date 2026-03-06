import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { errorHandler } from './middlewares/error.middleware.js';
import roomRoutes from './routes/room.route.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(errorHandler);

// Routes
app.use('/api/rooms', roomRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));