// backend/src/controllers/AuthController.js
import { AuthService } from '../services/AuthService.js';
import { validationResult } from 'express-validator';

export class AuthController {
  static async signup(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const result = await AuthService.signup(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshAccessToken(refreshToken);
      res.json(tokens);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  static async getCurrentUser(req, res) {
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(req.userId).populate('workspaces').populate('teams');

      if (!user) return res.status(404).json({ message: 'User not found' });

      res.json(AuthService.sanitizeUser(user));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateProfile(req, res) {
    try {
      const User = (await import('../models/User.js')).default;
      const { firstName, lastName, bio, avatar, timezone } = req.body;

      const user = await User.findByIdAndUpdate(
        req.userId,
        { firstName, lastName, bio, avatar, timezone },
        { new: true, runValidators: true }
      );

      res.json(AuthService.sanitizeUser(user));
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async changePassword(req, res) {
    try {
      const User = (await import('../models/User.js')).default;
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.userId).select('+password');

      if (!(await user.comparePassword(currentPassword))) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async logout(req, res) {
    try {
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}