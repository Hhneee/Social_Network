// Tải appbar và khởi tạo thông báo
document.addEventListener('DOMContentLoaded', () => {
    loadAppBar();
    fetchNotifications();
  
    // Tự động làm mới danh sách thông báo mỗi 10 giây
    const intervalId = setInterval(fetchNotifications, 10000);
  
    // Dừng interval khi người dùng rời khỏi trang
    window.addEventListener('beforeunload', () => {
      clearInterval(intervalId);
    });
  });
  
  // Lấy danh sách thông báo
  async function fetchNotifications() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Không tìm thấy token. Vui lòng đăng nhập.', 'error');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }
  
      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
          localStorage.removeItem('token');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể lấy danh sách thông báo');
      }
  
      const result = await response.json();
      if (result.success) {
        displayNotifications(result.data);
      } else {
        displayNotifications([]);
      }
    } catch (error) {
      showToast('Lỗi khi lấy thông báo: ' + error.message, 'error');
      displayNotifications([]);
    }
  }
  
  // Hiển thị danh sách thông báo
  function displayNotifications(notifications) {
    const notificationList = document.getElementById('notification-list');
    if (!notificationList) {
      console.error('Không tìm thấy #notification-list trong DOM');
      return;
    }
  
    notificationList.innerHTML = '';
  
    // Thêm nút "Đánh dấu tất cả đã đọc" nếu có thông báo chưa đọc
    const unreadCount = notifications.filter(n => !n.isRead).length;
    if (unreadCount > 0) {
      const markAllReadBtn = document.createElement('button');
      markAllReadBtn.className = 'mark-all-read-btn';
      markAllReadBtn.textContent = `Đánh dấu tất cả đã đọc (${unreadCount})`;
      markAllReadBtn.onclick = markAllAsRead;
      notificationList.appendChild(markAllReadBtn);
    }
  
    if (!notifications || notifications.length === 0) {
      const noNotifications = document.createElement('div');
      noNotifications.className = 'no-notifications';
      noNotifications.textContent = 'Không có thông báo nào.';
      notificationList.appendChild(noNotifications);
      return;
    }
  
    notifications.forEach(notification => {
      const notificationItem = document.createElement('div');
      notificationItem.className = `notification-item ${notification.isRead ? '' : 'unread'}`;
  
      // Nội dung thông báo
      const content = document.createElement('div');
      content.className = 'notification-content';
      content.innerHTML = `
        <p>${notification.message}</p>
        <div class="time">${new Date(notification.createdAt).toLocaleString()}</div>
      `;
      content.onclick = () => {
        if (notification.link) {
          window.location.href = notification.link;
        }
      };
  
      // Nút hành động
      const actions = document.createElement('div');
      actions.className = 'notification-actions';
  
      if (!notification.isRead) {
        const readBtn = document.createElement('button');
        readBtn.className = 'read-btn';
        readBtn.textContent = 'Đánh dấu đã đọc';
        readBtn.onclick = () => markAsRead(notification._id);
        actions.appendChild(readBtn);
      }
  
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Xóa';
      deleteBtn.onclick = () => deleteNotification(notification._id);
      actions.appendChild(deleteBtn);
  
      notificationItem.appendChild(content);
      notificationItem.appendChild(actions);
      notificationList.appendChild(notificationItem);
    });
  }
  
  // Đánh dấu một thông báo là đã đọc
  async function markAsRead(notificationId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Không tìm thấy token. Vui lòng đăng nhập.', 'error');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }
  
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
          localStorage.removeItem('token');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể đánh dấu đã đọc');
      }
  
      showToast('Đã đánh dấu thông báo là đã đọc!', 'success');
      fetchNotifications(); // Tải lại danh sách
    } catch (error) {
      showToast('Lỗi khi đánh dấu đã đọc: ' + error.message, 'error');
    }
  }
  
  // Đánh dấu tất cả thông báo là đã đọc
  async function markAllAsRead() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Không tìm thấy token. Vui lòng đăng nhập.', 'error');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }
  
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
          localStorage.removeItem('token');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể đánh dấu tất cả đã đọc');
      }
  
      showToast('Đã đánh dấu tất cả thông báo là đã đọc!', 'success');
      fetchNotifications(); // Tải lại danh sách
    } catch (error) {
      showToast('Lỗi khi đánh dấu tất cả đã đọc: ' + error.message, 'error');
    }
  }
  
  // Xóa thông báo
  async function deleteNotification(notificationId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Không tìm thấy token. Vui lòng đăng nhập.', 'error');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }
  
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
          localStorage.removeItem('token');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể xóa thông báo');
      }
  
      showToast('Đã xóa thông báo!', 'success');
      fetchNotifications(); // Tải lại danh sách
    } catch (error) {
      showToast('Lỗi khi xóa thông báo: ' + error.message, 'error');
    }
  }
  
  // Hàm hiển thị thông báo toast
  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
  
    // CSS cho toast
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.color = 'white';
    toast.style.zIndex = '10000';
    toast.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
    toast.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    toast.style.transition = 'opacity 0.5s';
  
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }