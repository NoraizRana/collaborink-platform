import express from 'express';
import { body, param, query } from 'express-validator';
import { TaskController } from '../controllers/TaskController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Create task
router.post(
  '/',
  [
    body('title').notEmpty().trim(),
    body('project').notEmpty(),
    body('description').optional().trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('dueDate').optional().isISO8601(),
  ],
  TaskController.createTask
);

// Get task
router.get('/:taskId', TaskController.getTask);

// Update task
router.put(
  '/:taskId',
  [
    param('taskId').notEmpty(),
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('status').optional().isIn(['todo', 'in-progress', 'review', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('assignee').optional(),
    body('dueDate').optional().isISO8601(),
  ],
  TaskController.updateTask
);

// Update task status
router.patch(
  '/:taskId/status',
  [
    param('taskId').notEmpty(),
    body('status').notEmpty().isIn(['todo', 'in-progress', 'review', 'done']),
  ],
  TaskController.updateTaskStatus
);

// Delete task
router.delete('/:taskId', TaskController.deleteTask);

// Add watcher
router.post('/:taskId/watchers', TaskController.addWatcher);

// Search tasks
router.get(
  '/search',
  [
    query('projectId').notEmpty(),
    query('query').notEmpty().trim(),
  ],
  TaskController.searchTasks
);

export default router;