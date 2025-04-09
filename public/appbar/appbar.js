// public/appbar/appbar.js

async function loadAppBar() {
  try {
    const response = await fetch('/appbar/appbar.html');
    const appbarHtml = await response.text();
    document.body.insertAdjacentHTML('afterbegin', appbarHtml);
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
  if (query.length === 0) {
    // Ẩn kết quả nếu không có từ khóa
    const resultsContainer = document.querySelector('#search-results');
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

    // Gọi endpoint /api/auth/users với query parameter q
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

  if (!users || users.length === 0) {
    const noResult = document.createElement('div');
    noResult.textContent = 'Không tìm thấy người dùng nào.';
    noResult.style.padding = '8px';
    resultsContainer.appendChild(noResult);
  } else {
    users.forEach(user => {
      const userElement = document.createElement('div');
      userElement.textContent = `${user.username}`;
      userElement.style.padding = '8px';
      userElement.style.cursor = 'pointer';
      userElement.onclick = () => {
        window.location.href = `/profile/${user.id}`;
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
    if (!resultsContainer.contains(event.target) && !document.querySelector('.search-form').contains(event.target)) {
      resultsContainer.style.display = 'none';
    }
    document.removeEventListener('click', hideResults);
  });
}

document.addEventListener('DOMContentLoaded', loadAppBar);

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/';
}