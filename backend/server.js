import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import signalingHandler from './src/socket/signalingHandler.js';
import path from 'path';

// Routes
import authRoutes from './src/routes/authRoutes.js';
import restaurantRoutes from './src/routes/restaurantRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Database connection
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);

// Socket.io Signaling
io.on('connection', (socket) => {
  signalingHandler(io, socket);
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
