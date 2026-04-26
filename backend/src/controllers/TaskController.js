import { TaskService } from '../services/TaskService.js';

export class TaskController {
  static async createTask(req, res) {
    try {
      const task = await TaskService.createTask(req.body, req.userId);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getTask(req, res) {
    try {
      const task = await TaskService.getTask(req.params.taskId);

      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateTask(req, res) {
    try {
      const task = await TaskService.updateTask(
        req.params.taskId,
        req.body,
        req.userId
      );
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateTaskStatus(req, res) {
    try {
      const { status } = req.body;
      const task = await TaskService.updateTaskStatus(
        req.params.taskId,
        status,
        req.userId
      );
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteTask(req, res) {
    try {
      await TaskService.deleteTask(req.params.taskId, req.userId);
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async addWatcher(req, res) {
    try {
      const task = await TaskService.addWatcher(req.params.taskId, req.userId);
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async searchTasks(req, res) {
    try {
      const { projectId, query } = req.query;
      const tasks = await TaskService.searchTasks(projectId, query);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}