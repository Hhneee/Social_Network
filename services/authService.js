const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

class AuthService {
  // Hàm xử lý đăng ký
  async registerUser({ username, email, password }) {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    console.log('User created:', user);
    return user;
  }

  // Hàm xử lý đăng nhập
  async loginUser({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }
    const token = jwt.sign({ _id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return { user, token };
  }

  // Hàm gửi mã OTP qua email
  async forgotPasswordUser({ email }) {
    const user = await User.findOne({ email });

    // Nếu không tìm thấy user, không thực hiện gửi email
    if (!user) {
      throw new Error('Email không tồn tại trong hệ thống');
    }

    // Tạo mã OTP 6 chữ số ngẫu nhiên và thời gian hết hạn (5 phút)
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresIn = new Date(Date.now() + 5 * 60 * 1000);

    // Lưu OTP và thời gian hết hạn vào user trong database
    user.otp = otp;
    user.otpExpiresIn = otpExpiresIn;
    await user.save();

    // Gửi email chứa mã OTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Mã xác nhận thay đổi mật khẩu',
      text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP ${otp} đã được gửi tới email: ${email}`);
  }

  // Xác minh OTP và cho phép đổi mật khẩu
  async verifyAndChangePassword({ email, otp, newPassword }) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Người dùng không tồn tại.');
    }

    if (user.otp !== otp) {
      throw new Error('Mã OTP không hợp lệ.');
    }

    if (user.otpExpiresIn < new Date()) {
      throw new Error('Mã OTP đã hết hạn.');
    }

    // Đổi mật khẩu sau khi xác minh OTP thành công
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null; // Xóa mã OTP sau khi sử dụng
    user.otpExpiresIn = null; // Xóa thời gian hết hạn OTP
    await user.save();
    console.log(`Mật khẩu của ${email} đã được thay đổi thành công.`);
  }

  // Hàm lấy danh sách tất cả user
  async getAllUsers() {
    try {
      const users = await User.find()
        .select('username email _id') // Chỉ lấy các trường cần thiết
        .lean(); // Trả về plain object để tăng hiệu suất

      return users;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách user:', error);
      throw new Error('Không thể lấy danh sách user');
    }
  }
}

module.exports = new AuthService();