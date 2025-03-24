const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

// Middleware xác thực token JWT
const auth = (req, res, next) => {
  // Lấy token từ header Authorization, loại bỏ tiền tố 'Bearer '
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Kiểm tra xem token có tồn tại không
  if (!token) {
    return res.status(401).json({ message: 'Không có token được cung cấp' });
  }

  try {
    // Xác minh token với khóa bí mật (jwtSecret)
    const decoded = jwt.verify(token, jwtSecret);

    // Kiểm tra xem payload có chứa _id không (tránh lỗi undefined sau này)
    if (!decoded._id) {
      return res.status(401).json({ message: 'Token không hợp lệ: Thiếu trường _id' });
    }

    // Gán thông tin người dùng đã giải mã vào req.user
    req.user = decoded;
    
    // Chuyển tiếp đến middleware hoặc route handler tiếp theo
    next();
  } catch (error) {
    // Xử lý lỗi cụ thể hơn (ví dụ: token hết hạn, token không đúng định dạng)
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token đã hết hạn' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
    // Lỗi không xác định khác
    return res.status(500).json({ message: 'Lỗi xác thực token', error: error.message });
  }
};

module.exports = auth;