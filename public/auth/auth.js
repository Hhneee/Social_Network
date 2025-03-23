
    document.getElementById('show-login').addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById('register-form').style.display = 'none';
      document.getElementById('forgot-form').style.display = 'none';
      document.getElementById('login-form').style.display = 'block';
      document.getElementById('reset-form').style.display = 'none';
    });

    document.getElementById('show-register').addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('forgot-form').style.display = 'none';
      document.getElementById('register-form').style.display = 'block';
      document.getElementById('reset-form').style.display = 'none';
    });

    document.getElementById('show-forgot').addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('register-form').style.display = 'none';
      document.getElementById('forgot-form').style.display = 'block';
      document.getElementById('reset-form').style.display = 'none';
    });

    document.getElementById('back-to-login').addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById('forgot-form').style.display = 'none';
      document.getElementById('register-form').style.display = 'none';
      document.getElementById('login-form').style.display = 'block';
      document.getElementById('reset-form').style.display = 'none';
    });

    document.getElementById('back-to-forgot').addEventListener('click', function (e) {
      e.preventDefault();
      document.getElementById('reset-form').style.display = 'none';
      document.getElementById('forgot-form').style.display = 'block';
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('register-form').style.display = 'none';
    });

    // Xử lý đăng ký
    document.getElementById('register').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('reg-username').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
    
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
    
        if (response.ok) {
          document.getElementById('reg-message').style.color = 'green';
          document.getElementById('reg-message').textContent = 'Đăng ký thành công!';
          setTimeout(() => {
            document.getElementById('show-login').click();
          }, 1000);
        } else {
          document.getElementById('reg-message').textContent = data.message;
        }
      } catch (error) {
        document.getElementById('reg-message').textContent = 'Đã có lỗi xảy ra!';
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
          document.getElementById('login-message').style.color = 'green';
          document.getElementById('login-message').textContent = 'Đăng nhập thành công!';
          localStorage.setItem('token', data.token);
          setTimeout(() => {
            alert('Chào mừng ' + data.user.username + '!');
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
  const email = document.getElementById('forgot-email').value;

  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();

    if (response.ok) {
      document.getElementById('forgot-message').style.color = 'green';
      document.getElementById('forgot-message').textContent = data.message;
    } else {
      document.getElementById('forgot-message').style.color = 'red';
      document.getElementById('forgot-message').textContent = data.message;
    }
  } catch (error) {
    document.getElementById('forgot-message').style.color = 'red';
    document.getElementById('forgot-message').textContent = 'Đã có lỗi xảy ra!';
  }
});

