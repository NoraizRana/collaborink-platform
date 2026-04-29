// backend/src/controllers/TaskController.js
import Task from '../models/Task.js';
import { validationResult } from 'express-validator';

export class TaskController {
  static async createTask(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const payload = {
        title: req.body.title,
        description: req.body.description,
        project: req.body.project,
        priority: req.body.priority,
        dueDate: req.body.dueDate,
        assignee: req.body.assignee,
        createdBy: req.userId,
      };

      if (req.body.column) payload.column = req.body.column;
      if (typeof req.body.position !== 'undefined') payload.position = req.body.position;

      const task = new Task(payload);
      await task.save();

      const populated = await Task.findById(task._id).populate('assignee createdBy');
      res.status(201).json(populated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getTask(req, res) {
    try {
      const task = await Task.findById(req.params.taskId).populate('assignee createdBy watchers attachments');
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async updateTask(req, res) {
    try {
      const update = { ...req.body };
      const allowed = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'column', 'position', 'labels', 'archived', 'metadata'];
      Object.keys(update).forEach((k) => { if (!allowed.includes(k)) delete update[k]; });

      const task = await Task.findByIdAndUpdate(req.params.taskId, update, { new: true }).populate('assignee createdBy watchers attachments');
      if (!task) return res.status(404).json({ message: 'Task not found' });

      res.json(task);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async updateTaskStatus(req, res) {
    try {
      const { status } = req.body;
      const task = await Task.findByIdAndUpdate(req.params.taskId, { status }, { new: true }).populate('assignee createdBy');
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async deleteTask(req, res) {
    try {
      await Task.findByIdAndDelete(req.params.taskId);
      res.json({ message: 'Task deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  static async searchTasks(req, res) {
    try {
      const { projectId, query } = req.query;
      const q = { project: projectId, $text: { $search: query } };
      const results = await Task.find(q).limit(50);
      res.json(results);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}