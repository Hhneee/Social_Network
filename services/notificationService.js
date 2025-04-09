// services/notificationService.js
const Notification = require('../models/notificationModel');

class NotificationService {
  // Tạo một thông báo mới
  async createNotification({ recipient, sender, type, message, link }) {
    try {
      const notification = new Notification({
        recipient,
        sender,
        type,
        message,
        link,
      });
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Lỗi khi tạo thông báo:', error);
      throw new Error('Không thể tạo thông báo: ' + error.message);
    }
  }

  // Lấy danh sách thông báo của một người dùng
  async getUserNotifications(userId, limit = 20) {
    try {
      const notifications = await Notification.find({ recipient: userId })
        .populate('sender', 'username fullName') // Lấy thông tin người gửi
        .sort({ createdAt: -1 }) // Sắp xếp theo thời gian giảm dần
        .limit(limit); // Giới hạn số lượng thông báo
      return notifications;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thông báo:', error);
      throw new Error('Không thể lấy danh sách thông báo: ' + error.message);
    }
  }

  // Đánh dấu một thông báo là đã đọc
  async markAsRead(notificationId) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
      if (!notification) {
        throw new Error('Không tìm thấy thông báo');
      }
      return notification;
    } catch (error) {
      console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
      throw new Error('Không thể đánh dấu thông báo đã đọc: ' + error.message);
    }
  }

  // Đánh dấu tất cả thông báo của một người dùng là đã đọc
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
      );
      return result;
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả thông báo đã đọc:', error);
      throw new Error('Không thể đánh dấu tất cả thông báo đã đọc: ' + error.message);
    }
  }

  // Xóa một thông báo
  async deleteNotification(notificationId) {
    try {
      const notification = await Notification.findByIdAndDelete(notificationId);
      if (!notification) {
        throw new Error('Không tìm thấy thông báo');
      }
      return notification;
    } catch (error) {
      console.error('Lỗi khi xóa thông báo:', error);
      throw new Error('Không thể xóa thông báo: ' + error.message);
    }
  }
}

module.exports = new NotificationService();