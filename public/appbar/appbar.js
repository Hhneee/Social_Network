// public/appbar/appbar.js

async function loadAppBar() {
  try {
    const response = await fetch('/appbar/appbar.html');
    const appbarHtml = await response.text();
    document.body.insertAdjacentHTML('afterbegin', appbarHtml);

    const searchInput = document.querySelector('#searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', debouncedSearchUsers);
    } else {
      console.error('Không tìm thấy #searchInput trong DOM');
    }
  } catch (error) {
    console.error('Lỗi khi tải AppBar:', error);
  }
}

// Hàm debounce để tránh gọi API quá nhiều
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Hàm tìm kiếm người dùng theo từ khóa
async function searchUsers() {
  const query = document.querySelector('#searchInput').value.trim();
  const resultsContainer = document.querySelector('#search-results');

  if (query.length === 0) {
    if (resultsContainer) {
      resultsContainer.style.display = 'none';
    }
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Không tìm thấy token. Vui lòng đăng nhập.');
      window.location.href = '/';
      return;
    }

    const response = await fetch(`/api/auth/users?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 404) {
        console.log('Không tìm thấy người dùng:', errorData.message);
        displaySearchResults(null);
        return;
      }
      throw new Error(errorData.message || `Không thể tìm kiếm người dùng. Mã lỗi: ${response.status}`);
    }

    const result = await response.json();
    console.log('API response:', result);
    const users = result.success && result.data ? result.data : [];
    displaySearchResults(users);
  } catch (error) {
    console.error('Lỗi khi tìm kiếm người dùng:', error);
    displaySearchResults(null);
  }
}

// Áp dụng debounce cho searchUsers
const debouncedSearchUsers = debounce(searchUsers, 300);

// Hàm hiển thị kết quả tìm kiếm
function displaySearchResults(users) {
  const resultsContainer = document.querySelector('#search-results');
  if (!resultsContainer) {
    console.error('Không tìm thấy #search-results trong DOM');
    return;
  }

  resultsContainer.innerHTML = '';
  resultsContainer.style.display = 'block';

  if (!users || !Array.isArray(users) || users.length === 0) {
    const noResult = document.createElement('div');
    noResult.textContent = 'Không tìm thấy người dùng nào.';
    noResult.style.padding = '8px';
    resultsContainer.appendChild(noResult);
    return;
  }

  users.forEach((user, index) => {
    const userElement = document.createElement('div');
    userElement.textContent = `${user.username || 'Không có username'}`;
    userElement.style.padding = '8px';
    userElement.style.cursor = 'pointer';

    userElement.onclick = () => {
      const userId = user._id || user.id;
      if (!userId) {
        console.error(`Không tìm thấy ID cho user tại index ${index}:`, user);
        return;
      }

      // Chuyển hướng trực tiếp đến trang cá nhân của người dùng
      window.location.href = `/appbar/profilesSearch.html?id=${userId}`; // Thay đổi URL nếu cần
      resultsContainer.style.display = 'none';
    };

    userElement.onmouseover = () => {
      userElement.style.backgroundColor = '#f0f0f0';
    };
    userElement.onmouseout = () => {
      userElement.style.backgroundColor = 'transparent';
    };

    resultsContainer.appendChild(userElement);
  });
}

// Ẩn kết quả khi nhấp ra ngoài
document.addEventListener('click', function hideResults(event) {
  const resultsContainer = document.querySelector('#search-results');
  if (
    resultsContainer &&
    !resultsContainer.contains(event.target) &&
    !document.querySelector('.search-form')?.contains(event.target)
  ) {
    resultsContainer.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', loadAppBar);

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/';
}