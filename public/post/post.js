// public/post/post.js
const token = localStorage.getItem('token'); // Giả sử token được lưu sau khi đăng nhập
// Kiểm tra và hiển thị token trong console
if (token) {
  console.log('Token:', token);
} else {
  console.log('Token không tồn tại trong localStorage.');
}
const mediaList = [];

// Thêm media vào danh sách tạm
function addMedia() {
  const url = document.getElementById('mediaUrl').value;
  const type = document.getElementById('mediaType').value;
  if (url) {
    mediaList.push({ type, url });
    const preview = document.getElementById('mediaPreview');
    preview.innerHTML += `<p>${type}: ${url} <button onclick="removeMedia(${mediaList.length - 1})">Xóa</button></p>`;
    document.getElementById('mediaUrl').value = '';
  }
}

// Xóa media khỏi danh sách tạm
function removeMedia(index) {
  mediaList.splice(index, 1);
  renderMediaPreview();
}

// Hiển thị lại danh sách media tạm
function renderMediaPreview() {
  const preview = document.getElementById('mediaPreview');
  preview.innerHTML = mediaList.map((item, index) => 
    `<p>${item.type}: ${item.url} <button onclick="removeMedia(${index})">Xóa</button></p>`
  ).join('');
}

// Đăng bài viết
async function createPost() {
  const content = document.getElementById('postContent').value;
  if (!content) return alert('Vui lòng nhập nội dung!');

  // Lấy token từ localStorage
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Bạn cần đăng nhập để đăng bài!');
    window.location.href = '/auth.html'; // Chuyển hướng đến trang đăng nhập nếu không có token
    return;
  }

  try {
    const response = await fetch('/api/posts/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Gửi token trong header Authorization
      },
      body: JSON.stringify({ content, media: mediaList }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Đăng bài thành công!');
      document.getElementById('postContent').value = '';
      mediaList.length = 0; // Xóa danh sách media tạm
      renderMediaPreview();
    } else {
      alert(data.message || 'Đăng bài thất bại!');
    }
  } catch (error) {
    console.error('Lỗi khi đăng bài:', error);
    alert('Có lỗi xảy ra: ' + error.message);
  }
}