// controllers/messageController.js
const Message = require('../models/messagesModel');

class MessageController {
  async sendMessage(req, res) {
    try {
      const { receiverId, content, media } = req.body;
      const senderId = req.user._id;

      if (!receiverId || !content) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin để gửi tin nhắn' });
      }

      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
        media: media || [],
      });

      await message.save();

      // Gửi tin nhắn qua WebSocket
      const io = req.app.get('io');
      const userSockets = req.app.get('userSockets');
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', message);
      }

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi gửi tin nhắn', error: error.message });
    }
  }

  async getMessages(req, res) {
    try {
      const { userId } = req.params; // ID của người dùng đang chat
      const currentUserId = req.user._id; // ID của người dùng hiện tại

      // Lấy tin nhắn giữa hai người dùng
      const messages = await Message.find({
        $or: [
          { sender: currentUserId, receiver: userId },
          { sender: userId, receiver: currentUserId },
        ],
      })
        .sort({ createdAt: 1 }) // Sắp xếp theo thời gian
        .populate('sender', 'username') // Lấy thông tin người gửi
        .populate('receiver', 'username'); // Lấy thông tin người nhận

      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      console.error('Lỗi khi lấy tin nhắn:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi lấy tin nhắn', error: error.message });
    }
  }

  async deleteMessage(req, res) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Không xác định được người dùng' });
      }
      const { messageId } = req.params;
      const userId = req.user._id;
      const result = await Message.findOneAndDelete({ _id: messageId, sender: userId });
      if (!result) {
        return res.status(404).json({ success: false, message: 'Tin nhắn không tồn tại hoặc không thể xóa' });
      }
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Lỗi khi xóa tin nhắn:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi xóa tin nhắn', error: error.message });
    }
  }

  async getAllMessages(req, res) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'Không xác định được người dùng' });
      }
      const userId = req.user._id;
      const messages = await Message.find({
        $or: [{ sender: userId }, { receiver: userId }],
      }).sort({ createdAt: 1 }); // Sắp xếp theo thời gian
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      console.error('Lỗi khi lấy tất cả tin nhắn:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi lấy tất cả tin nhắn', error: error.message });
    }
  }
}

module.exports = new MessageController();

async function sendMessage() {
  const input = document.getElementById('message-input');
  const content = input.value.trim();

  if (!content || !selectedUserId || !currentUserId) return;

  const message = {
    senderId: currentUserId,
    receiverId: selectedUserId,
    content,
  };

  try {
    const response = await fetch('http://localhost:5000/api/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    if (result.success) {
      input.value = '';
      displayMessage({
        content: result.data.content,
        isSent: true,
        createdAt: result.data.createdAt,
      });
    }
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn:', error);
  }
}