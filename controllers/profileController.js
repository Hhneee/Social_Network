
const profileService = require('../services/profileService');

const createProfile = async (req, res) => {
  try {
    const { userId, username } = req.body;
    if (!userId || !username) {
      return res.status(400).json({ message: 'Thiếu userId hoặc username' });
    }
    const savedProfile = await profileService.createProfile(req.body);
    res.status(201).json({ message: 'Tạo profile thành công', profile: savedProfile });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo profile', error: error.message });
  }
};

const getProfileByUsername = async (req, res) => {
  try {
    let { username } = req.params;

   
    username = decodeURIComponent(username);
    console.log('Username nhận được:', username);

    if (!username) {
      return res.status(400).json({ success: false, message: 'Thiếu username' });
    }

    const profile = await profileService.getProfileByUsername(username);

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin profile thành công',
      data: profile,
    });
  } catch (error) {
    console.error('Lỗi trong getProfileByUsername:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy thông tin profile',
    });
  }
};


const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId format' });
    }
    const profile = await profileService.getProfileByUserId(userId);
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error('Lỗi getProfileByUserId:', error);
    res.status(500).json({ success: false, message: error.message || 'Lỗi server' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'Thiếu userId' });
    const profile = await profileService.updateProfile(userId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: profile,
    });
  } catch (error) {
    console.error('Lỗi trong updateProfile:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật profile',
    });
  }
};

const followUser = async (req, res) => {
  try {
    const { userId, targetUserId } = req.body;
    if (!userId || !targetUserId) {
      return res.status(400).json({ message: 'Thiếu userId hoặc targetUserId' });
    }
    const updatedProfile = await profileService.followUser(userId, targetUserId);
    return res.status(200).json({
      success: true,
      message: 'Follow thành công',
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Lỗi trong followUser:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi follow người dùng',
    });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { userId, targetUserId } = req.body;
    if (!userId || !targetUserId) {
      return res.status(400).json({ message: 'Thiếu userId hoặc targetUserId' });
    }
    const updatedProfile = await profileService.unfollowUser(userId, targetUserId);
    return res.status(200).json({
      success: true,
      message: 'Unfollow thành công',
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Lỗi trong unfollowUser:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi unfollow người dùng',
    });
  }
};

const addPostToProfile = async (req, res) => {
  try {
    const { userId, postId } = req.body;
    if (!userId || !postId) {
      return res.status(400).json({ message: 'Thiếu userId hoặc postId' });
    }
    const profile = await profileService.addPostToProfile(userId, postId);
    return res.status(200).json({
      success: true,
      message: 'Thêm bài viết vào profile thành công',
      data: profile,
    });
  } catch (error) {
    console.error('Lỗi trong addPostToProfile:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi thêm bài viết vào profile',
    });
  }
};

// Thêm controller cho trạng thái online/offline
const updateOnlineStatus = async (req, res) => {
  try {
    const { userId, isOnline } = req.body;
    if (!userId || typeof isOnline !== 'boolean') {
      return res.status(400).json({ message: 'Thiếu userId hoặc isOnline không hợp lệ' });
    }
    const profile = await profileService.updateOnlineStatus(userId, isOnline);
    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái online thành công',
      data: profile,
    });
  } catch (error) {
    console.error('Lỗi trong updateOnlineStatus:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật trạng thái online',
    });
  }
};

module.exports = {
  createProfile,
  getProfileByUsername,
  getProfileByUserId,
  updateProfile,
  followUser,
  unfollowUser,
  addPostToProfile,
  updateOnlineStatus, // Thêm hàm mới
};