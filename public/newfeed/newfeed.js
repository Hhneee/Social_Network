// public/newfeed/newfeed.js
const token = localStorage.getItem('token'); // Giả sử token được lưu sau khi đăng nhập

// Tải danh sách bài viết khi trang được mở
window.onload = loadPosts;

async function loadPosts() {
  try {
    const response = await fetch('/api/posts', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (response.ok) {
      renderPosts(data.posts);
    } else {
      alert('Lỗi khi tải bài viết: ' + data.message);
    }
  } catch (error) {
    alert('Có lỗi xảy ra: ' + error.message);
  }
}

function renderPosts(posts) {
  const container = document.getElementById('postsContainer');
  container.innerHTML = posts.map(post => `
    <div class="post">
      <p><strong>${post.user.username}</strong>: ${post.content}</p>
      <div>
        ${post.media.map(media => 
          media.type === 'image' 
            ? `<img src="${media.url}" class="media-item" alt="media">`
            : `<video src="${media.url}" class="media-item" controls></video>`
        ).join('')}
      </div>
      <p>Likes: ${post.likes.length} | Comments: ${post.comments.length} | Shares: ${post.shares.length}</p>
      <button onclick="likePost('${post._id}')">Thích</button>
      <button onclick="showCommentForm('${post._id}')">Bình luận</button>
      <button onclick="sharePost('${post._id}')">Chia sẻ</button>
      <div id="commentForm-${post._id}" style="display:none;">
        <textarea id="comment-${post._id}" placeholder="Viết bình luận"></textarea>
        <button onclick="commentPost('${post._id}')">Gửi</button>
      </div>
      <div>
        ${post.comments.map(comment => 
          `<p><strong>${comment.user.username}</strong>: ${comment.content}</p>`
        ).join('')}
      </div>
    </div>
  `).join('');
}

async function likePost(postId) {
  try {
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      loadPosts(); // Tải lại danh sách bài viết
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert('Có lỗi xảy ra: ' + error.message);
  }
}

function showCommentForm(postId) {
  const commentForm = document.getElementById(`commentForm-${postId}`);
  commentForm.style.display = commentForm.style.display === 'block' ? 'none' : 'block';
}

async function commentPost(postId) {
  const content = document.getElementById(`comment-${postId}`).value;
  if (!content) return alert('Vui lòng nhập bình luận!');

  try {
    const response = await fetch(`/api/posts/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    if (response.ok) {
      document.getElementById(`comment-${postId}`).value = '';
      loadPosts(); // Tải lại danh sách bài viết
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert('Có lỗi xảy ra: ' + error.message);
  }
}

async function sharePost(postId) {
  try {
    const response = await fetch(`/api/posts/${postId}/share`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      loadPosts(); // Tải lại danh sách bài viết
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert('Có lỗi xảy ra: ' + error.message);
  }
}