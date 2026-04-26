import { ChatService } from '../services/ChatService.js';

export class ChatController {
  static async createChannel(req, res) {
    try {
      const channel = await ChatService.createChannel(req.body, req.userId);
      res.status(201).json(channel);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getChannelMessages(req, res) {
    try {
      const messages = await ChatService.getChannelMessages(
        req.params.channelId,
        req.query.page,
        req.query.limit
      );
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async sendMessage(req, res) {
    try {
      const message = await ChatService.sendMessage(req.body, req.userId);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async editMessage(req, res) {
    try {
      const { content } = req.body;
      const message = await ChatService.editMessage(
        req.params.messageId,
        content,
        req.userId
      );
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteMessage(req, res) {
    try {
      const message = await ChatService.deleteMessage(req.params.messageId, req.userId);
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async addReaction(req, res) {
    try {
      const { emoji } = req.body;
      const message = await ChatService.addReaction(
        req.params.messageId,
        emoji,
        req.userId
      );
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createDirectMessage(req, res) {
    try {
      const { recipientId } = req.body;
      const dm = await ChatService.createDirectMessage(recipientId, req.userId);
      res.status(201).json(dm);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}