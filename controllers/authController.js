const authService = require('../services/authService');

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
    const { user, token } = await authService.loginUser({ email, password });
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      },
      token,
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
  try {
    console.log('Forgot password request received:', req.body);
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng cung cấp email' 
      });
    }
    await authService.forgotPasswordUser({ email });
    return res.status(200).json({ 
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu' 
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi server, vui lòng thử lại sau' 
    });
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
module.exports = { register, login, forgotPassword, getAllUsers, getUserByUsername };