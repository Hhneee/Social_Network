// public/newfeed/newfeed.js
const token = localStorage.getItem('token'); // Giả sử token được lưu sau khi đăng nhập

// Tải danh sách bài viết khi trang được mở
window.onload = loadPosts;

async function loadPosts() {
  try {
    const response = await fetch('/api/posts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Thêm Authorization cho bảo mật
      },
    });
    const data = await response.json();
    if (response.ok) {
      renderPosts(data.posts);
    } else {
      alert('Lỗi khi tải bài viết: ' + data.message);
    }
  } catch (error) {
    alert('Có lỗi xảy ra khi tải bài viết: ' + error.message);
  }
}

function renderPosts(posts) {
  const container = document.getElementById('postsContainer');
  const currentUserId = getCurrentUserId(); // Hàm giả định để lấy ID người dùng
  container.innerHTML = posts.map(post => {
    const visibleComments = post.comments.slice(0, 2); // Chỉ hiển thị 2 bình luận đầu
    const hasMoreComments = post.comments.length > 2;

    return `
      <div class="post">
        <div class="postimage">
          <img src="${post.user.avatar || 'https://cbam.edu.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-46nlrTXx.jpg'}" class="avatar" alt="avatar">
          <div class="userandtime">
            <h4>${post.user.username}</h4>
            <h6>${new Date(post.createdAt).toLocaleString()}</h6>
          </div>
        </div>
        <p>${post.content}</p>
        <div class="media-container">
          ${post.media.map(media => 
            media.type === 'image' 
              ? `<img src="${media.url}" class="media-item" alt="media">`
              : `<video src="${media.url}" class="media-item" controls></video>`
          ).join('')}
        </div>
        <div class="startline">
          <div class="post-like">
            Likes: ${post.likes.length}
          </div>
          <div class="post-commentshare">
            Comments: ${post.comments.length}   Shares: ${post.shares.length}
          </div>
        </div>
        <div class="post-actions">
          <button class="like-btn ${post.likes.includes(currentUserId) ? 'liked' : ''}" onclick="likePost('${post._id}')">
            <i class="fa fa-thumbs-up"></i> Like
          </button>
          <button class="comment-btn" onclick="showCommentForm('${post._id}')">
            <i class="fa fa-comment"></i> Comment
          </button>
          <button class="share-btn" onclick="sharePost('${post._id}')">
            <i class="fa fa-share"></i> Share
          </button>
        </div>
        <div id="commentForm-${post._id}" class="comment-form">
          <textarea id="comment-${post._id}" placeholder="Write a comment..."></textarea>
          <button onclick="commentPost('${post._id}')">Post</button>
        </div>
        <div class="comment-section" id="comments-${post._id}">
          ${visibleComments.map(comment => 
            `<p><strong>${comment.user.username}</strong>: ${comment.content}</p>`
          ).join('')}
          ${hasMoreComments ? `
            <a href="#" class="view-more" onclick="showAllComments('${post._id}', event)">Xem thêm (${post.comments.length - 2} bình luận)</a>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function likePost(postId) {
  const button = document.querySelector(`.like-btn[onclick="likePost('${postId}')"]`);
  button.classList.toggle('liked');

  try {
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      loadPosts(); // Tải lại danh sách bài viết
    } else {
      button.classList.toggle('liked');
      alert('Lỗi khi thích bài viết: ' + data.message);
    }
  } catch (error) {
    button.classList.toggle('liked');
    alert('Có lỗi xảy ra khi thích bài viết: ' + error.message);
  }
}

function showCommentForm(postId) {
  const commentForm = document.getElementById(`commentForm-${postId}`);
  commentForm.classList.toggle('active');
}

async function showAllComments(postId, event) {
  event.preventDefault();
  const commentSection = document.getElementById(`comments-${postId}`);

  // Kiểm tra token trước khi gửi yêu cầu
  if (!token) {
    commentSection.innerHTML += `<p style="color: red;">Vui lòng đăng nhập để xem bình luận.</p>`;
    return;
  }

  try {
    const response = await fetch(`/api/posts/${postId}/comments`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.text(); // Lấy thông tin lỗi từ server
      throw new Error(`Không thể tải bình luận: ${response.status} - ${errorData}`);
    }

    const comments = await response.json();
    commentSection.innerHTML = comments.map(comment => 
      `<p><strong>${comment.user.username}</strong>: ${comment.content}</p>`
    ).join('');

  } catch (error) {
    console.error('Lỗi khi tải bình luận:', error.message);
    commentSection.innerHTML += `<p style="color: red;">Có lỗi xảy ra: ${error.message}</p>`;
  }
}

async function commentPost(postId) {
  const content = document.getElementById(`comment-${postId}`).value.trim();
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
      document.getElementById(`comment-${postId}`).value = ''; // Xóa textarea
      loadPosts(); // Tải lại danh sách bài viết
    } else {
      alert('Lỗi khi đăng bình luận: ' + data.message);
    }
  } catch (error) {
    alert('Có lỗi xảy ra khi đăng bình luận: ' + error.message);
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
      alert('Lỗi khi chia sẻ bài viết: ' + data.message);
    }
  } catch (error) {
    alert('Có lỗi xảy ra khi chia sẻ bài viết: ' + error.message);
  }
}

// Hàm giả định để lấy ID người dùng từ token (cần triển khai thực tế)
function getCurrentUserId() {
  // Giả sử token là JWT, bạn cần giải mã nó để lấy userId
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Giải mã phần payload của JWT
    return payload.userId || payload.id; // Tùy backend trả về
  } catch (error) {
    console.error('Lỗi khi giải mã token:', error);
    return null; // Hoặc xử lý lỗi khác
  }
}