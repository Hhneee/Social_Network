const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword); 
router.post('/reset-password', authController.resetPassword); // Route đổi mật khẩu bằng OTP
router.get('/users', authController.getAllUsers); // Route mới để lấy danh sách người dùng
router.get('/users/:username', authController.getUserByUsername);
module.exports = router;