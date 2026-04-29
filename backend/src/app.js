// backend/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import boardRoutes from './routes/boards.js';

// routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import chatRoutes from './routes/chat.js';
import workspaceRoutes from './routes/workspaces.js';
import fileRoutes from './routes/files.js';
import calendarRoutes from './routes/calendar.js';

// middleware
import { errorHandler } from './middleware/errorHandler.js';
import logger from './middleware/logger.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(mongoSanitize());
app.use(express.json({ limit: '50mb' }));
app.use('/api/boards', boardRoutes);
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Basic rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use('/api/', limiter);

// request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip });
  next();
});

// health
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/calendar', calendarRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found', path: req.path }));

// error handler
app.use(errorHandler);

export default app;
