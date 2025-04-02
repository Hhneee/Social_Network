// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messagesController');
const auth = require('../middleware/auth');

// Gửi tin nhắn
router.post('/send', auth, messageController.sendMessage);

// Lấy tin nhắn giữa 2 người
router.get('/user/:userId', auth, messageController.getMessages);

// Xóa tin nhắn
router.delete('/:messageId', auth, messageController.deleteMessage);

// Lấy tất cả tin nhắn của người dùng hiện tại
router.get('/', auth, messageController.getAllMessages);

module.exports = router;