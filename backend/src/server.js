// backend/src/server.js
import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB, connectRedis } from './config/database.js';
import logger from './middleware/logger.js';

const PORT = process.env.PORT || 3000;

// Keep a map of userId -> socketId (optional, for presence/DMs)
const activeUsers = new Map();

async function startServer() {
  try {
    // Connect databases
    await connectDB();
    // connectRedis returns a client or throws; we'll attempt but not fail if Redis unavailable
    try {
      await connectRedis();
    } catch (err) {
      logger.warn('Redis connection failed (continuing without redis):', err?.message || err);
    }

    const server = http.createServer(app);

    // Create Socket.IO server
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // Make io available to route handlers/controllers via req.app.get('io')
    app.set('io', io);

    io.on('connection', (socket) => {
      logger.info(`Socket connected ${socket.id}`);

      // Optional: receive authenticated userId from client after connect
      socket.on('user:online', (userId) => {
        try {
          if (userId) {
            activeUsers.set(userId, socket.id);
            socket.data.userId = userId;
            // Broadcast presence update to interested parties (or a 'presence' room)
            io.emit('user:status-update', { userId, status: 'online' });
            logger.info(`User online: ${userId}`);
          }
        } catch (err) {
          logger.error('user:online handler error', err);
        }
      });

      // Join a room (frontend should send a room name like `project:<projectId>`)
      socket.on('room:join', (roomId) => {
        try {
          if (!roomId) return;
          socket.join(roomId);
          logger.info(`Socket ${socket.id} joined room ${roomId}`);
        } catch (err) {
          logger.error('room:join handler error', err);
        }
      });

      // Leave a room
      socket.on('room:leave', (roomId) => {
        try {
          if (!roomId) return;
          socket.leave(roomId);
          logger.info(`Socket ${socket.id} left room ${roomId}`);
        } catch (err) {
          logger.error('room:leave handler error', err);
        }
      });

      // Board re-ordering emitted by client -> broadcast updated board to room
      socket.on('board:reorder', (data) => {
        try {
          // data: { room: 'project:<id>', board: { ... } }
          if (!data?.room) return;
          io.to(data.room).emit('board:updated', data.board);
        } catch (err) {
          logger.error('board:reorder handler error', err);
        }
      });

      // Task moved between columns
      socket.on('task:moved', (data) => {
        try {
          // data: { room: 'project:<id>', taskId, fromColumnId, toColumnId, position, userId }
          if (!data?.room) return;
          io.to(data.room).emit('task:moved', data);
        } catch (err) {
          logger.error('task:moved handler error', err);
        }
      });

      // Typing indicator for tasks/comments
      socket.on('task:typing', (data) => {
        try {
          // data: { room: 'project:<id>', taskId, userId, typing: true/false }
          if (!data?.room) return;
          socket.to(data.room).emit('task:typing', data);
        } catch (err) {
          logger.error('task:typing handler error', err);
        }
      });

      // Chat message send (channels / DMs)
      socket.on('message:send', (data) => {
        try {
          // data: { room: 'project:<id>' || 'dm:<id>', message: {...} }
          if (!data?.room || !data?.message) return;
          // persist message in DB in controller/API route if required; here we just forward
          io.to(data.room).emit('message:received', data.message);
        } catch (err) {
          logger.error('message:send handler error', err);
        }
      });

      // Handle disconnect: update presence map and broadcast
      socket.on('disconnect', (reason) => {
        try {
          const userId = socket.data?.userId;
          if (userId && activeUsers.get(userId) === socket.id) {
            activeUsers.delete(userId);
            io.emit('user:status-update', { userId, status: 'offline' });
            logger.info(`User ${userId} went offline`);
          }
          logger.info(`Socket disconnected ${socket.id} (${reason})`);
        } catch (err) {
          logger.error('disconnect handler error', err);
        }
      });

      // Socket error catch
      socket.on('error', (err) => {
        logger.error('Socket error:', err);
      });
    });

    // Start HTTP server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`✅ Server running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      // Force exit after 10s
      setTimeout(() => {
        logger.warn('Forcing server shutdown');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error('Failed to start server', err);
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

startServer();