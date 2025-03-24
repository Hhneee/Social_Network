// public/appbar/appbar.js
async function loadAppBar() {
    try {
      const response = await fetch('/appbar/appbar.html');
      const appbarHtml = await response.text();
      document.body.insertAdjacentHTML('afterbegin', appbarHtml); // Chèn AppBar vào đầu body
    } catch (error) {
      console.error('Lỗi khi tải AppBar:', error);
    }
  }
  
  // Tự động tải AppBar khi trang được mở
  document.addEventListener('DOMContentLoaded', loadAppBar);
  
  // Hàm đăng xuất
  function logout() {
    localStorage.removeItem('token'); 
  
    window.location.href = '/'; // Chuyển hướng về trang đăng nhập (giả sử là trang gốc)
  }