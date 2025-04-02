const Message = require('../models/messagesModel'); // Đường dẫn đến model Message

class MessageService {
  async sendMessage(senderId, receiverId, content, media = []) {
    try {
      // Kiểm tra đầu vào
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
      throw new Error(`Lỗi khi gửi tin nhắn: ${error.message}`);
    }
  }
  async getMessagesBetweenUsers(userId1, userId2) {
    try {
      if (!userId1 || !userId2) {
        throw new Error('Thiếu userId để lấy tin nhắn');
      }
  
      return await Message.find({
        $or: [
          { sender: userId1, receiver: userId2 },
          { sender: userId2, receiver: userId1 },
        ],
      })
        .populate('sender', 'username')
        .populate('receiver', 'username')
        .sort('createdAt')
        .lean(); // Tăng hiệu suất
    } catch (error) {
      throw new Error(`Lỗi khi lấy tin nhắn: ${error.message}`);
    }
  } 

  async deleteMessage(messageId, userId) {
    try {
      if (!messageId || !userId) {
        throw new Error('Thiếu thông tin để xóa tin nhắn');
      }
  
      const message = await Message.findOneAndDelete({
        _id: messageId,
        sender: userId, // Kết hợp điều kiện tìm và xóa
      });
  
      if (!message) {
        throw new Error('Không tìm thấy tin nhắn hoặc bạn không có quyền xóa');
      }
  
      return { message: 'Tin nhắn đã được xóa' };
    } catch (error) {
      throw new Error(`Lỗi khi xóa tin nhắn: ${error.message}`);
    }
  }

  // Lấy tất cả tin nhắn của một người dùng
  async getAllUserMessages(userId) {
    try {
      if (!userId) {
        throw new Error('Thiếu userId để lấy tin nhắn');
      }
  
      return await Message.find({
        $or: [
          { sender: userId },
          { receiver: userId },
        ],
      })
        .populate('sender', 'username')
        .populate('receiver', 'username')
        .sort('createdAt')
        .lean();
    } catch (error) {
      throw new Error(`Lỗi khi lấy tất cả tin nhắn: ${error.message}`);
    }
  }
}

module.exports = new MessageService();