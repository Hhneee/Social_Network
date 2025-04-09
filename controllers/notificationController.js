// controllers/notificationController.js
const notificationService = require('../services/notificationService');
// Tạo thông báo mới (dành cho client)
const createNotification = async (req, res) => {
    try {
      const { recipient, type, message, link } = req.body;
      const sender = req.user._id; // Lấy sender từ middleware xác thực
  
      // Kiểm tra dữ liệu đầu vào
      if (!recipient || !type || !message) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin cần thiết để tạo thông báo',
        });
      }
  
      // Kiểm tra quyền: Chỉ cho phép tạo thông báo nếu sender là người dùng hiện tại
      const notification = await notificationService.createNotification({
        recipient,
        sender,
        type,
        message,
        link,
      });
  
      return res.status(201).json({
        success: true,
        message: 'Tạo thông báo thành công',
        data: notification,
      });
    } catch (error) {
      console.error('Error in createNotification:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo thông báo',
        error: error.message,
      });
    }
  };
// Lấy danh sách thông báo của người dùng
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id; // Giả sử bạn có middleware xác thực để lấy userId
    const limit = parseInt(req.query.limit) || 20; // Lấy limit từ query, mặc định là 20
    const notifications = await notificationService.getUserNotifications(userId, limit);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách thông báo thành công',
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách thông báo',
      error: error.message,
    });
  }
};

// Đánh dấu một thông báo là đã đọc
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ID thông báo',
      });
    }

    const notification = await notificationService.markAsRead(notificationId);
    return res.status(200).json({
      success: true,
      message: 'Đánh dấu thông báo đã đọc thành công',
      data: notification,
    });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi đánh dấu thông báo đã đọc',
      error: error.message,
    });
  }
};

// Đánh dấu tất cả thông báo là đã đọc
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await notificationService.markAllAsRead(userId);
    return res.status(200).json({
      success: true,
      message: 'Đánh dấu tất cả thông báo đã đọc thành công',
      data: result,
    });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi đánh dấu tất cả thông báo đã đọc',
      error: error.message,
    });
  }
};

// Xóa một thông báo
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ID thông báo',
      });
    }

    const notification = await notificationService.deleteNotification(notificationId);
    return res.status(200).json({
      success: true,
      message: 'Xóa thông báo thành công',
      data: notification,
    });
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa thông báo',
      error: error.message,
    });
  }
};

module.exports = {
    createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};