document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Ngăn tải lại trang
    const email = e.target.email.value;
  
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const result = await response.json();
      if (response.ok) {
        alert('Yêu cầu đặt lại mật khẩu đã được gửi. Kiểm tra email của bạn!');
      } else {
        alert('Lỗi: ' + result.message || 'Không thể gửi yêu cầu.');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      alert('Có lỗi xảy ra khi gửi yêu cầu.');
    }
  });