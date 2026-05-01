// backend/src/routes/tasks.js
import express from 'express';
import { body } from 'express-validator';
import { TaskController } from '../controllers/TaskController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Create task
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('title is required'),
    body('project').notEmpty().withMessage('project is required'),
  ],
  TaskController.createTask
);

// List / search tasks
router.get('/', TaskController.searchTasks);

// Get task
router.get('/:taskId', TaskController.getTask);

// Update task
router.put('/:taskId', TaskController.updateTask);

// Update task status
router.patch('/:taskId/status', TaskController.updateTaskStatus);

// Delete task //deleted one
router.delete('/:taskId', TaskController.deleteTask);

export default router;