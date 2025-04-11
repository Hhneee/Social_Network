// public/post/post.js
const token = localStorage.getItem('token');
const mediaList = [];

// Thêm media vào danh sách tạm
function addMedia() {
  const url = document.getElementById('mediaUrl').value.trim();
  const type = document.getElementById('mediaType').value;
  if (url) {
    mediaList.push({ type, url });
    renderMediaPreview();
    document.getElementById('mediaUrl').value = '';
  } else {
    alert('Vui lòng nhập URL hợp lệ!');
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
  preview.innerHTML = mediaList
    .map((item, index) => {
      if (item.type === 'image') {
        return `
          <div>
            <img src="${item.url}" alt="Hình ảnh xem trước">
            <button onclick="removeMedia(${index})">Xóa</button>
          </div>`;
      } else if (item.type === 'video') {
        return `
          <div>
            <video src="${item.url}" controls></video>
            <button onclick="removeMedia(${index})">Xóa</button>
          </div>`;
      }
      return ''; // Không hiển thị nếu không phải hình ảnh hoặc video
    })
    .join('');
}

// Đăng bài viết
async function createPost(event) {
  event.preventDefault();

  const content = document.getElementById('postContent').value.trim();
  if (!content && mediaList.length === 0) {
    alert('Vui lòng nhập nội dung hoặc thêm media!');
    return;
  }

  if (!token) {
    alert('Bạn cần đăng nhập để đăng bài!');
    window.location.href = '/auth.html';
    return;
  }

  try {
    const response = await fetch('/api/posts/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, media: mediaList }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Đăng bài thành công!');
      document.getElementById('postContent').value = '';
      mediaList.length = 0;
      renderMediaPreview();
    } else {
      alert(data.message || 'Đăng bài thất bại!');
    }
  } catch (error) {
    console.error('Lỗi khi đăng bài:', error);
    alert('Có lỗi xảy ra: ' + error.message);
  }
}

document.getElementById('post-form').addEventListener('submit', createPost);