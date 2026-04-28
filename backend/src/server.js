// backend/src/server.js
import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { connectDB, connectRedis } from './config/database.js';
import app from './app.js';
import { Server } from 'socket.io';
import logger from './middleware/logger.js';

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB();
    await connectRedis();

    const server = http.createServer(app);

    // Socket.io (basic)
    const io = new Server(server, {
      cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true },
    });

    io.on('connection', (socket) => {
      logger.info(`Socket connected ${socket.id}`);
      socket.on('disconnect', () => logger.info(`Socket disconnected ${socket.id}`));
    });

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`✅ Server running on port ${PORT}`);
    });

    // graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down...');
      server.close(() => process.exit(0));
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();