// Định nghĩa URL cơ sở cho API
const PROFILE_API_ENDPOINT = '/api/profile';
const POSTS_API_ENDPOINT = '/api/posts';

// Hàm lấy dữ liệu profile từ API
async function fetchProfileData(userId, token) {
    const url = `${PROFILE_API_ENDPOINT}/profile-user/${userId}`;
    console.log('Gửi yêu cầu profile đến:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Không thể tải hồ sơ. Mã lỗi: ${response.status}. Chi tiết: ${errorText}`);
    }

    return response.json();
}

// Hàm lấy dữ liệu bài viết từ API
async function fetchPostsData(userId, token) {
    const url = `${POSTS_API_ENDPOINT}/${userId}`;
    console.log('Gửi yêu cầu posts đến:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Không thể tải bài viết. Mã lỗi: ${response.status}. Chi tiết: ${errorText}`);
    }

    return response.json();
}

// Hàm hiển thị thông tin profile
function displayProfile(profileData) {
    document.getElementById('profileFullName').textContent = profileData.username || 'Chưa đặt tên';
    // document.getElementById('profileUsername').textContent = `@${profileData.username}`;
    document.getElementById('profileBio').textContent = profileData.bio || 'Chưa có tiểu sử';
    document.getElementById('followersCount').textContent = profileData.followersCount || 0;
    document.getElementById('followingCount').textContent = profileData.followingCount || 0;
    document.getElementById('friendsCount').textContent = profileData.friendsCount || 0;
    document.getElementById('profileLocation').textContent = profileData.location || 'Chưa xác định';
    document.getElementById('profileGender').textContent = profileData.gender || 'Chưa chọn';
    document.getElementById('profileBirthDate').textContent = profileData.birthDate
        ? new Date(profileData.birthDate).toLocaleDateString('vi-VN')
        : 'Chưa đặt';
    document.getElementById('profileStatus').textContent = profileData.isOnline
        ? 'Đang hoạt động'
        : `Hoạt động cuối: ${profileData.lastSeen ? new Date(profileData.lastSeen).toLocaleString('vi-VN') : 'Không rõ'}`;

    document.getElementById('profileAvatar').src = profileData.avatar || '/images/default-avatar.png';
    document.getElementById('profileCover').style.backgroundImage = profileData.coverPhoto
        ? `url(${profileData.coverPhoto})`
        : 'none';
}

// Hàm hiển thị danh sách bài viết
function displayPosts(posts, userId, token) {
    const container = document.getElementById('postsList');
    if (!container) {
        console.error('Không tìm thấy postsList trong DOM');
        return;
    }

    container.innerHTML = '';

    if (!posts || posts.length === 0) {
        container.innerHTML = '<p>Người dùng này chưa có bài viết nào.</p>';
        return;
    }

    container.innerHTML = posts.map(post => {
        const visibleComments = post.comments.slice(0, 2); // Chỉ hiển thị 2 bình luận đầu
        const hasMoreComments = post.comments.length > 2;

        return `
            <div class="post">
                <div class="postimage">
                    <img src="${post.user.avatar || 'https://cbam.edu.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-46nlrTXx.jpg'}" class="avatar" alt="avatar">
                    <div class="userandtime">
                        <h4>${post.user.username}</h4>
                        <h6>${new Date(post.createdAt).toLocaleString('vi-VN')}</h6>
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
                    <button class="like-btn ${post.likes.includes(userId) ? 'liked' : ''}" onclick="likePost('${post._id}', '${userId}', '${token}')">
                        <i class="fa fa-thumbs-up"></i> Like
                    </button>
                    <button class="comment-btn" onclick="showCommentForm('${post._id}')">
                        <i class="fa fa-comment"></i> Comment
                    </button>
                    <button class="share-btn" onclick="sharePost('${post._id}', '${userId}', '${token}')">
                        <i class="fa fa-share"></i> Share
                    </button>
                </div>
                <div id="commentForm-${post._id}" class="comment-form">
                    <div class="comment-form-inner">
                        <img src="${post.user.avatar || 'https://cbam.edu.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-46nlrTXx.jpg'}" class="avatar-comment-form" alt="avatar">
                        <div class="comment-input-wrapper">
                            <textarea id="comment-${post._id}" placeholder="Viết bình luận..." rows="1"></textarea>
                            <button onclick="commentPost('${post._id}', '${userId}', '${token}')">
                                <i class="fa fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="comment-section" id="comments-${post._id}">
                    ${visibleComments.map(comment => 
                        `<p><img src="${comment.user.avatar || 'https://cbam.edu.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-46nlrTXx.jpg'}" class="avatar-comment" alt="avatar"><strong>${comment.user.username}</strong>: ${comment.content}</p>`
                    ).join('')}
                    ${hasMoreComments ? `
                        <a href="#" class="view-more" onclick="showAllComments('${post._id}', event, '${token}')">Xem thêm (${post.comments.length - 2} bình luận)</a>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    // Cập nhật số lượng bài viết
    document.getElementById('postsCount').textContent = posts.length;
}

// Hàm xử lý like bài viết
async function likePost(postId, userId, token) {
    const button = document.querySelector(`.like-btn[onclick="likePost('${postId}', '${userId}', '${token}')"]`);
    button.classList.toggle('liked');

    try {
        const response = await fetch(`${POSTS_API_ENDPOINT}/${postId}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
            loadProfile(); // Tải lại profile và bài viết
        } else {
            button.classList.toggle('liked');
            alert('Lỗi khi thích bài viết: ' + data.message);
        }
    } catch (error) {
        button.classList.toggle('liked');
        alert('Có lỗi xảy ra khi thích bài viết: ' + error.message);
    }
}

// Hàm hiển thị form bình luận
function showCommentForm(postId) {
    const commentForm = document.getElementById(`commentForm-${postId}`);
    commentForm.classList.toggle('active');
}

// Hàm hiển thị tất cả bình luận
async function showAllComments(postId, event, token) {
    event.preventDefault();
    const commentSection = document.getElementById(`comments-${postId}`);

    try {
        const response = await fetch(`${POSTS_API_ENDPOINT}/${postId}/comments`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const comments = await response.json();
        if (response.ok) {
            commentSection.innerHTML = comments.map(comment => 
                `<p><img src="${comment.user.avatar || 'https://cbam.edu.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-46nlrTXx.jpg'}" class="avatar-comment" alt="avatar"><strong>${comment.user.username}</strong>: ${comment.content}</p>`
            ).join('');
        } else {
            alert('Lỗi khi tải bình luận: ' + comments.message);
        }
    } catch (error) {
        commentSection.innerHTML += `<p style="color: red;">Có lỗi xảy ra: ${error.message}</p>`;
    }
}

// Hàm đăng bình luận
async function commentPost(postId, userId, token) {
    const content = document.getElementById(`comment-${postId}`).value.trim();
    if (!content) return alert('Vui lòng nhập bình luận!');

    try {
        const response = await fetch(`${POSTS_API_ENDPOINT}/${postId}/comment`, {
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
            loadProfile(); // Tải lại profile và bài viết
        } else {
            alert('Lỗi khi đăng bình luận: ' + data.message);
        }
    } catch (error) {
        alert('Có lỗi xảy ra khi đăng bình luận: ' + error.message);
    }
}

// Hàm chia sẻ bài viết
async function sharePost(postId, userId, token) {
    try {
        const response = await fetch(`${POSTS_API_ENDPOINT}/${postId}/share`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
            loadProfile(); // Tải lại profile và bài viết
        } else {
            alert('Lỗi khi chia sẻ bài viết: ' + data.message);
        }
    } catch (error) {
        alert('Có lỗi xảy ra khi chia sẻ bài viết: ' + error.message);
    }
}

// Hàm chính để tải profile và bài viết
async function loadProfile() {
    let userId;

    // Lấy userId từ URL: hỗ trợ cả path (/profile/123) và query (/profile?id=123)
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('id')) {
        userId = urlParams.get('id'); // Nếu URL là /profile?id=123
    } else {
        userId = pathSegments.pop(); // Nếu URL là /profile/123
    }

    if (!userId) {
        console.error('Không tìm thấy userId trong URL');
        document.querySelector('.profile-container').innerHTML = '<p>Không tìm thấy người dùng.</p>';
        return;
    }

    console.log('userId:', userId); // Debug: kiểm tra userId

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Không tìm thấy token. Vui lòng đăng nhập.');
            window.location.href = '/';
            return;
        }

        console.log('Token:', token); // Debug: kiểm tra token

        // Lấy dữ liệu profile
        console.log('Fetching profile:', `${PROFILE_API_ENDPOINT}/profile-user/${userId}`);
        const profileResult = await fetchProfileData(userId, token);
        console.log('Profile data:', profileResult);

        if (profileResult.success && profileResult.data) {
            displayProfile(profileResult.data);
        } else {
            throw new Error('Dữ liệu hồ sơ không hợp lệ');
        }

        // Lấy dữ liệu bài viết
        console.log('Fetching posts:', `${POSTS_API_ENDPOINT}/user/${userId}`);
        const postsResult = await fetchPostsData(userId, token);
        console.log('Posts data:', postsResult);

        if (postsResult.success && postsResult.data) {
            displayPosts(postsResult.data, userId, token);
        } else {
            throw new Error('Dữ liệu bài viết không hợp lệ');
        }
    } catch (error) {
        console.error('Lỗi khi tải trang cá nhân hoặc bài viết:', error);
        document.querySelector('.profile-container').innerHTML = '<p>Không thể tải hồ sơ người dùng.</p>';
    }
}

// Khởi động khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', loadProfile);