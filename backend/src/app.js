import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import chatRoutes from './routes/chat.js';
import workspaceRoutes from './routes/workspaces.js';
import fileRoutes from './routes/files.js';
import calendarRoutes from './routes/calendar.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import logger from './middleware/logger.js';

const app = express();

// ==================== Security Middleware ====================
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(mongoSanitize());

// ==================== Body Parser ====================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==================== Rate Limiting ====================
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// ==================== Request Logging ====================
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userId: req.userId,
  });
  next();
});

// ==================== Health Check ====================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ==================== Routes ====================
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/calendar', calendarRoutes);

// ==================== 404 Handler ====================
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
  });
});

// ==================== Error Handler ====================
app.use(errorHandler);

// ==================== Socket.io Setup ====================
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Store active socket connections
const activeUsers = new Map();

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // User goes online
  socket.on('user:online', (userId) => {
    activeUsers.set(userId, socket.id);
    io.emit('user:status-update', {
      userId,
      status: 'online',
    });
  });

  // User goes offline
  socket.on('disconnect', () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        io.emit('user:status-update', {
          userId,
          status: 'offline',
        });
        break;
      }
    }
    logger.info(`User disconnected: ${socket.id}`);
  });

  // Real-time messaging
  socket.on('message:send', (data) => {
    io.to(data.channelId).emit('message:received', data);
  });

  // Typing indicator
  socket.on('message:typing', (data) => {
    socket.broadcast.to(data.channelId).emit('message:typing', data);
  });

  // Task update
  socket.on('task:update', (data) => {
    io.to(data.projectId).emit('task:updated', data);
  });

  // User activity
  socket.on('activity:log', (data) => {
    io.emit('activity:new', data);
  });

  // Join room
  socket.on('room:join', (roomId) => {
    socket.join(roomId);
    logger.info(`User ${socket.id} joined room ${roomId}`);
  });

  // Leave room
  socket.on('room:leave', (roomId) => {
    socket.leave(roomId);
    logger.info(`User ${socket.id} left room ${roomId}`);
  });

  // Error handler
  socket.on('error', (error) => {
    logger.error('Socket error:', error);
  });
});

export { server, app };