// Định nghĩa URL cơ sở cho API
const PROFILE_API_ENDPOINT = 'http://localhost:5000/api/profile';
const POSTS_API_ENDPOINT = 'http://localhost:5000/api/posts';

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

    const responseText = await response.text();
    console.log('Phản hồi profile từ server:', response.status, responseText);

    if (!response.ok) {
        throw new Error(`Lỗi từ server (profile): ${responseText}`);
    }

    return JSON.parse(responseText);
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

    const responseText = await response.text();
    console.log('Phản hồi posts từ server:', response.status, responseText);

    if (!response.ok) {
        throw new Error(`Lỗi từ server (posts): ${responseText}`);
    }

    return JSON.parse(responseText);
}

// Hàm kiểm tra thông tin đăng nhập
function checkAuth() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    console.log('Token từ localStorage:', token);
    console.log('userId từ localStorage:', userId);

    if (!token || !userId) {
        console.warn('Thiếu thông tin xác thực:', { token: !!token, userId: !!userId });
        alert('Vui lòng đăng nhập để tiếp tục!');
        window.location.replace('/auth.html');
        return false;
    }

    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
        console.error('userId không đúng định dạng ObjectId:', userId);
        alert('userId không hợp lệ! Vui lòng kiểm tra lại quá trình đăng nhập.');
        return false;
    }

    return { token, userId };
}

// Hàm hiển thị thông tin profile
function displayProfile(profileData) {
    console.log('Dữ liệu profile:', profileData);

    document.getElementById('profileFullName').textContent = profileData.username || 'Chưa đặt tên';
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

// Hàm hiển thị danh sách bài viết (tích hợp từ newfeed.js)
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
                    <textarea id="comment-${post._id}" placeholder="Viết bình luận..."></textarea>
                    <button onclick="commentPost('${post._id}', '${userId}', '${token}')">Đăng</button>
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
            initializeProfile(); // Tải lại profile và bài viết
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
            initializeProfile(); // Tải lại profile và bài viết
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
            initializeProfile(); // Tải lại profile và bài viết
        } else {
            alert('Lỗi khi chia sẻ bài viết: ' + data.message);
        }
    } catch (error) {
        alert('Có lỗi xảy ra khi chia sẻ bài viết: ' + error.message);
    }
}

// Hàm chính để khởi chạy
async function initializeProfile() {
    try {
        const auth = checkAuth();
        if (!auth) return;

        // Lấy dữ liệu profile
        const profileResult = await fetchProfileData(auth.userId, auth.token);
        console.log('Kết quả từ API profile:', profileResult);

        if (profileResult.success && profileResult.data) {
            displayProfile(profileResult.data);
        } else {
            throw new Error('Dữ liệu profile không hợp lệ');
        }

        // Lấy dữ liệu bài viết
        const postsResult = await fetchPostsData(auth.userId, auth.token);
        console.log('Kết quả từ API posts:', postsResult);

        if (postsResult.success && postsResult.data) {
            displayPosts(postsResult.data, auth.userId, auth.token);
        } else {
            throw new Error('Dữ liệu bài viết không hợp lệ');
        }
    } catch (error) {
        console.error('Lỗi trong quá trình tải profile hoặc posts:', error);
        alert(`Không thể tải dữ liệu: ${error.message}`);
    }
}

// Khởi động khi DOM sẵn sàng
window.addEventListener('load', initializeProfile);