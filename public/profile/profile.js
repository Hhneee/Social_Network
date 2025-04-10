

// Định nghĩa URL cơ sở cho API
const PROFILE_API_ENDPOINT = 'http://localhost:5000/api/profile';

// Hàm lấy dữ liệu từ API
async function fetchProfileData(userId, token) {
    const url = `${PROFILE_API_ENDPOINT}/profile-user/${userId}`;
    console.log('Gửi yêu cầu đến:', url);
    console.log('userId gửi đi:', userId);
    console.log('Token gửi đi:', token);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    const responseText = await response.text();
    console.log('Phản hồi từ server:', response.status, responseText);

    if (!response.ok) {
        throw new Error(`Lỗi từ server: ${responseText}`);
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

    // Kiểm tra định dạng userId
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

    document.getElementById('profileFullName').textContent = profileData.fullName || 'Chưa đặt tên';
    document.getElementById('profileUsername').textContent = profileData.username ? `@${profileData.username}` : 'Không có username';
    document.getElementById('profileBio').textContent = profileData.bio || 'Chưa có tiểu sử';
    document.getElementById('postsCount').textContent = profileData.posts?.length || 0;
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

    // Cập nhật hình ảnh
    document.getElementById('profileAvatar').src = profileData.avatar || '/images/default-avatar.png';
    document.getElementById('profileCover').style.backgroundImage = profileData.coverPhoto
        ? `url(${profileData.coverPhoto})`
        : 'none';
}

// Hàm chính để khởi chạy
async function initializeProfile() {
    try {
        const auth = checkAuth();
        if (!auth) return;

        const result = await fetchProfileData(auth.userId, auth.token);
        console.log('Kết quả từ API:', result);

        if (result.success && result.data) {
            displayProfile(result.data);
        } else {
            throw new Error('Dữ liệu profile không hợp lệ');
        }
    } catch (error) {
        console.error('Lỗi trong quá trình tải profile:', error);
        alert(`Không thể tải profile: ${error.message}`);
    }
}

// Khởi động khi DOM sẵn sàng
window.addEventListener('load', initializeProfile);