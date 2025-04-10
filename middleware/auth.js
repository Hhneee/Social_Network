// middleware/auth.js
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

// Middleware xác thực token JWT
const auth = (req, res, next) => {
  // Lấy token từ header Authorization
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có token được cung cấp hoặc định dạng không đúng' });
  }

  const token = authHeader.replace('Bearer ', '');

  // Kiểm tra token rỗng
  if (!token) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }

  try {
    // Xác minh token với khóa bí mật (jwtSecret)
    const decoded = jwt.verify(token, jwtSecret);

    // Kiểm tra xem payload có chứa _id không
    if (!decoded._id) {
      return res.status(401).json({ message: 'Token không hợp lệ: Thiếu trường _id' });
    }

    // Gán thông tin người dùng đã giải mã vào req.user
    req.user = decoded;
    next();
  } catch (error) {
    // Xử lý lỗi cụ thể
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    // Lỗi không xác định khác
    console.error('Lỗi xác thực token:', error);
    return res.status(500).json({ message: 'Lỗi xác thực token', error: error.message });
  }
};

module.exports = auth;