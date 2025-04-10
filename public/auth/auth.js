// public/auth/auth.js

// Hàm hiển thị form (tối ưu hóa logic lặp lại)
function showForm(formId) {
  const forms = ['login-form', 'register-form', 'forgot-form', 'reset-form'];
  forms.forEach((id) => {
    document.getElementById(id).style.display = id === formId ? 'block' : 'none';
  });
}

// Gắn sự kiện chuyển đổi form
document.addEventListener('DOMContentLoaded', () => {
  // Chuyển đến form đăng nhập
  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    showForm('login-form');
  });

  // Chuyển đến form đăng ký
  document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    showForm('register-form');
  });

  // Chuyển đến form quên mật khẩu
  document.getElementById('show-forgot').addEventListener('click', (e) => {
    e.preventDefault();
    showForm('forgot-form');
  });

  // Quay lại form đăng nhập
  document.getElementById('back-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    showForm('login-form');
  });

  // Quay lại form quên mật khẩu
  document.getElementById('back-to-forgot').addEventListener('click', (e) => {
    e.preventDefault();
    showForm('forgot-form');
  });
});

// Hàm kiểm tra định dạng email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Xử lý đăng ký
document.getElementById('register').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const messageElement = document.getElementById('reg-message');

  // Kiểm tra input
  if (!username || !email || !password) {
    messageElement.style.color = 'red';
    messageElement.textContent = 'Vui lòng điền đầy đủ thông tin!';
    return;
  }

  if (!isValidEmail(email)) {
    messageElement.style.color = 'red';
    messageElement.textContent = 'Email không hợp lệ!';
    return;
  }

  if (password.length < 6) {
    messageElement.style.color = 'red';
    messageElement.textContent = 'Mật khẩu phải có ít nhất 6 ký tự!';
    return;
  }

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      messageElement.style.color = 'green';
      messageElement.textContent = 'Đăng ký thành công!';
      setTimeout(() => {
        document.getElementById('show-login').click();
      }, 1000);
    } else {
      messageElement.style.color = 'red';
      messageElement.textContent = data.message || 'Đăng ký thất bại!';
    }
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    messageElement.style.color = 'red';
    messageElement.textContent = 'Đã có lỗi xảy ra. Vui lòng thử lại!';
  }
});

// Xử lý đăng nhập
document.getElementById('login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (response.ok) {
      // Lưu token và userId vào localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id); // Thêm dòng này để lưu userId

      document.getElementById('login-message').style.color = 'green';
      document.getElementById('login-message').textContent = 'Đăng nhập thành công!';
      setTimeout(() => {
        window.location.href = '/newfeed/newfeed.html'; // Đường dẫn đến trang cần chuyển
      }, 1000);
    } else {
      document.getElementById('login-message').textContent = data.message;
    }
  } catch (error) {
    document.getElementById('login-message').textContent = 'Đã có lỗi xảy ra!';
  }
});

// Xử lý quên mật khẩu
document.getElementById('forgot').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('forgot-email').value.trim();
  const messageElement = document.getElementById('forgot-message');

  // Kiểm tra input
  if (!email) {
    messageElement.style.color = 'red';
    messageElement.textContent = 'Vui lòng nhập email!';
    return;
  }

  if (!isValidEmail(email)) {
    messageElement.style.color = 'red';
    messageElement.textContent = 'Email không hợp lệ!';
    return;
  }

  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      messageElement.style.color = 'green';
      messageElement.textContent = data.message || 'Mã OTP đã được gửi tới email của bạn!';
      setTimeout(() => {
        showForm('reset-form'); // Chuyển đến form đặt lại mật khẩu
      }, 1000);
    } else {
      messageElement.style.color = 'red';
      messageElement.textContent = data.message || 'Không thể gửi mã OTP!';
    }
  } catch (error) {
    console.error('Lỗi khi gửi yêu cầu quên mật khẩu:', error);
    messageElement.style.color = 'red';
    messageElement.textContent = 'Đã có lỗi xảy ra. Vui lòng thử lại!';
  }
});

// Xử lý đặt lại mật khẩu
document.getElementById('reset').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('forgot-email').value.trim();
  const otp = document.getElementById('reset-otp').value.trim();
  const newPassword = document.getElementById('reset-password').value.trim();
  const confirmPassword = document.getElementById('reset-confirm-password').value.trim();
  const messageElement = document.getElementById('reset-message');

  // Kiểm tra input
  if (!email || !otp || !newPassword || !confirmPassword) {
    messageElement.style.color = 'red';
    messageElement.textContent = 'Vui lòng điền đầy đủ thông tin!';
    return;
  }

  if (newPassword !== confirmPassword) {
    messageElement.style.color = 'red';
    messageElement.textContent = 'Mật khẩu xác nhận không khớp!';
    return;
  }

  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      messageElement.style.color = 'green';
      messageElement.textContent = data.message || 'Đặt lại mật khẩu thành công!';
      setTimeout(() => {
        window.location.href = data.redirect; // Chuyển về trang gốc
      }, 2000); // Chờ 2 giây trước khi chuyển hướng
    } else {
      messageElement.style.color = 'red';
      messageElement.textContent = data.message || 'Đặt lại mật khẩu thất bại!';
    }
  } catch (error) {
    console.error('Lỗi khi đặt lại mật khẩu:', error);
    messageElement.style.color = 'red';
    messageElement.textContent = 'Đã có lỗi xảy ra. Vui lòng thử lại!';
  }
});