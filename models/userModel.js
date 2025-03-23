const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String }, // Lưu mã OTP
  otpExpiresIn: { type: Date }, // Thời gian hết hạn OTP
  createdAt: { type: Date, default: Date.now }, // Thời điểm tạo tài khoản
});

module.exports = mongoose.model('User', userSchema);