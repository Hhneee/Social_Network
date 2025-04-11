const Message = require('../models/messagesModel');

class MessageService {
  async sendMessage(senderId, receiverId, content, media = []) {
    try {
      if (!senderId || !receiverId || !content) {
        throw new Error('Thiếu thông tin cần thiết để gửi tin nhắn');
      }

      const message = new Message({ sender: senderId, receiver: receiverId, content, media });
      await message.save();

      // Populate ngay sau khi lưu
      await message.populate([
        { path: 'sender', select: 'username' },
        { path: 'receiver', select: 'username' },
      ]);

      return message;
    } catch (error) {
      console.error('Lỗi khi lưu tin nhắn:', error);
      throw new Error('Không thể lưu tin nhắn: ' + error.message);
    }
  }
}

module.exports = new MessageService();