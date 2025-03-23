const authService = require('../services/authService');

// Hàm xử lý đăng ký
const register = async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { username, email, password } = req.body;
    const user = await authService.registerUser({ username, email, password });
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.log('Error in register:', error);
    res.status(400).json({ message: error.message });
  }
};

// Hàm xử lý đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });
    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Hàm xử lý quên mật khẩu với bảo mật nâng cao
const forgotPassword = async (req, res) => {
  try {
    console.log('Forgot password request received:', req.body);
    const { email } = req.body;

    // Gọi hàm service để xử lý logic: kiểm tra email, tạo token và gửi email reset
    // Trong authService.forgotPasswordUser, bạn cũng cần phải xử lý theo cách bảo mật,
    // ví dụ: nếu email không tồn tại thì vẫn không báo lỗi, để không cho người ngoài biết.
    await authService.forgotPasswordUser({ email });

    // Trả về thông báo chung, không tiết lộ email đó có tồn tại hay không
    res.status(200).json({ 
      message: 'Nếu email có trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.' 
    });
  } catch (error) {
    console.log('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau.' });
  }
};

module.exports = { register, login, forgotPassword };