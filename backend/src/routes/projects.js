import express from 'express';
import { body, param, query } from 'express-validator';
import { ProjectController } from '../controllers/ProjectController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(authMiddleware);

// Create project
router.post(
  '/',
  [
    body('name').notEmpty().trim(),
    body('workspace').notEmpty(),
    body('description').optional().trim(),
  ],
  ProjectController.createProject
);

// Get project
router.get('/:projectId', ProjectController.getProject);

// Get project tasks
router.get(
  '/:projectId/tasks',
  [
    query('status').optional(),
    query('priority').optional(),
    query('assignee').optional(),
  ],
  ProjectController.getProjectTasks
);

// Get project stats
router.get('/:projectId/stats', ProjectController.getProjectStats);

// Update project
router.put(
  '/:projectId',
  [
    param('projectId').notEmpty(),
    body('name').optional().trim(),
    body('description').optional().trim(),
  ],
  ProjectController.updateProject
);

// Add member to project
router.post(
  '/:projectId/members',
  [
    param('projectId').notEmpty(),
    body('userId').notEmpty(),
    body('role').optional().isIn(['owner', 'lead', 'member']),
  ],
  ProjectController.addMember
);

// Remove member from project
router.delete(
  '/:projectId/members/:memberId',
  ProjectController.removeMember
);

// Delete project
router.delete('/:projectId', ProjectController.deleteProject);

export default router;