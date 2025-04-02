// controllers/messageController.js
const messageService = require('../services/messagesService');

class MessageController {
  async sendMessage(req, res) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Không xác định được người dùng' });
      }
      const { receiverId, content, media } = req.body;
      const senderId = req.user._id;
      const message = await messageService.sendMessage(senderId, receiverId, content, media);

      // Gửi thông báo qua WebSocket đến người nhận
      const io = req.app.get('io');
      const userSockets = req.app.get('userSockets');
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', {
          senderId: senderId, // Thêm senderId để người nhận biết ai gửi
          content: message.content,
          isSent: false, // Đối với người nhận, tin nhắn là nhận (không phải gửi)
          createdAt: message.createdAt,
          media: message.media || [],
        });
      }

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getMessages(req, res) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Không xác định được người dùng' });
      }
      const { userId } = req.params;
      const currentUserId = req.user._id;
      const messages = await messageService.getMessagesBetweenUsers(currentUserId, userId);
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteMessage(req, res) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Không xác định được người dùng' });
      }
      const { messageId } = req.params;
      const userId = req.user._id;
      const result = await messageService.deleteMessage(messageId, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getAllMessages(req, res) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Không xác định được người dùng' });
      }
      const userId = req.user._id;
      const messages = await messageService.getAllUserMessages(userId);
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new MessageController();