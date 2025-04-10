const authService = require('../services/authService');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');

// [Các hàm hiện có giữ nguyên...]

// Hàm xử lý đăng ký
const register = async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ username, email và password' });
    }
    const user = await authService.registerUser({ username, email, password });
    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      },
    });
  } catch (error) {
    console.error('Error in register:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Username hoặc email đã tồn tại' 
      });
    }
    return res.status(400).json({ 
      success: false,
      message: error.message || 'Lỗi trong quá trình đăng ký' 
    });
  }
};

// Hàm xử lý đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng cung cấp email và password' 
      });
    }
    const { user, token, profile } = await authService.loginUser({ email, password });
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      },
      token,
      profile
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(401).json({ 
      success: false,
      message: error.message || 'Email hoặc mật khẩu không đúng' 
    });
  }
};

// Hàm xử lý quên mật khẩu
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Tạo OTP và thời gian hết hạn
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiresIn = Date.now() + 10 * 60 * 1000; // OTP hết hạn sau 10 phút
    await user.save();

    // Gửi OTP qua email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Hàm lấy danh sách users
const getAllUsers = async (req, res) => {
  try {
    const query = req.query.q || '';
    const users = await authService.getAllUsers(query);
    const userList = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName || ''
    }));
    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách users thành công',
      data: userList,
      count: userList.length
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách users',
      error: error.message
    });
  }
};

const getUserByUsername = async (req, res) => {
  try {
    const query = req.query.q || '';
    const users = await authService.getAllUsers(query);
    const userList = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName || ''
    }));
    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách users thành công',
      data: userList,
      count: userList.length
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách users',
      error: error.message
    });
  }
};

// Hàm xử lý đặt lại mật khẩu
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, và mật khẩu mới là bắt buộc.' });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Kiểm tra OTP và thời gian hết hạn
    if (user.otp !== otp || user.otpExpiresIn < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu và xóa OTP
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiresIn = undefined;
    await user.save();

    // Gửi phản hồi thành công
    res.status(200).json({
      message: 'Mật khẩu đã được thay đổi thành công!',
      redirect: 'http://localhost:5000', // Thay đổi đường dẫn về trang gốc
    });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

module.exports = { register, login, forgotPassword, getAllUsers, getUserByUsername, resetPassword };