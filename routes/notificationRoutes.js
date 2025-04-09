// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth'); // Middleware xác thực
router.post('/', authMiddleware, notificationController.createNotification);
// Lấy danh sách thông báo của người dùng
router.get('/', authMiddleware, notificationController.getUserNotifications);

// Đánh dấu một thông báo là đã đọc
router.put('/:notificationId/read', authMiddleware, notificationController.markAsRead);

// Đánh dấu tất cả thông báo là đã đọc
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);

// Xóa một thông báo
router.delete('/:notificationId', authMiddleware, notificationController.deleteNotification);

module.exports = router;