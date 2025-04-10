
const Profile = require('../models/profileModel');

class ProfileService {
  async createProfile(userData) {
    try {
      const profile = await Profile.create({
        userId: userData._id,
        username: userData.username,
        fullName: userData.fullName || '',
        bio: '',
        avatar: 'default-avatar.png',
        coverPhoto: '',
        birthDate: null,
        gender: 'other',
        location: '',
        followers: [],
        following: [],
        posts: [],
        friendsCount: 0,
        followersCount: 0,
        followingCount: 0,
        isOnline: false,
        lastSeen: null,
      });
      return profile;
    } catch (error) {
      throw new Error('Lỗi khi tạo profile: ' + error.message);
    }
  }

  async getProfileByUsername(username) {
    try {
      console.log('Đang tìm profile với username:', username);
  
      const profile = await Profile.findOne({ username })
        .populate('userId', 'email')
        .populate('followers', 'username')
        .populate('following', 'username')
        .populate('posts')
        .lean();
  
      console.log('Kết quả tìm profile:', profile);
  
      if (!profile) {
        throw new Error(`Không tìm thấy profile với username: ${username}`);
      }
  
      return profile;
    } catch (error) {
      throw new Error('Lỗi khi lấy profile: ' + error.message);
    }
  }
  

  async getProfileByUserId(userId) {
    try {
      const profile = await Profile.findOne({ userId })
        .populate('userId', 'email')
        .populate('followers', 'username')
        .populate('following', 'username')
        .populate('posts')
        .lean();
      if (!profile) throw new Error('Không tìm thấy profile');
      return profile;
    } catch (error) {
      throw new Error('Lỗi khi lấy profile theo userId: ' + error.message);
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const allowedFields = {
        fullName: updateData.fullName,
        bio: updateData.bio,
        avatar: updateData.avatar,
        coverPhoto: updateData.coverPhoto,
        birthDate: updateData.birthDate,
        gender: updateData.gender,
        location: updateData.location,
      };
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { ...allowedFields, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );
      if (!profile) throw new Error('Không tìm thấy profile để cập nhật');
      return profile;
    } catch (error) {
      throw new Error('Lỗi khi cập nhật profile: ' + error.message);
    }
  }

  async followUser(userId, targetUserId) {
    try {
      if (userId === targetUserId) throw new Error('Không thể follow chính mình');
      const userProfile = await Profile.findOne({ userId });
      const targetProfile = await Profile.findOne({ userId: targetUserId });

      if (!userProfile || !targetProfile) throw new Error('Không tìm thấy profile');

      if (!userProfile.following.includes(targetUserId)) {
        userProfile.following.push(targetUserId);
        userProfile.followingCount += 1;
      }
      if (!targetProfile.followers.includes(userId)) {
        targetProfile.followers.push(userId);
        targetProfile.followersCount += 1;
      }

      // Logic friendsCount: Nếu cả hai follow lẫn nhau, tăng friendsCount
      if (targetProfile.following.includes(userId)) {
        userProfile.friendsCount += 1;
        targetProfile.friendsCount += 1;
      }

      await userProfile.save();
      await targetProfile.save();
      return { userProfile, targetProfile };
    } catch (error) {
      throw new Error('Lỗi khi follow: ' + error.message);
    }
  }

  async unfollowUser(userId, targetUserId) {
    try {
      if (userId === targetUserId) throw new Error('Không thể unfollow chính mình');
      const userProfile = await Profile.findOne({ userId });
      const targetProfile = await Profile.findOne({ userId: targetUserId });

      if (!userProfile || !targetProfile) throw new Error('Không tìm thấy profile');

      userProfile.following = userProfile.following.filter(id => id.toString() !== targetUserId.toString());
      userProfile.followingCount = Math.max(0, userProfile.followingCount - 1);

      targetProfile.followers = targetProfile.followers.filter(id => id.toString() !== userId.toString());
      targetProfile.followersCount = Math.max(0, targetProfile.followersCount - 1);

      // Logic friendsCount: Nếu trước đó là bạn bè, giảm friendsCount
      if (targetProfile.following.includes(userId)) {
        userProfile.friendsCount = Math.max(0, userProfile.friendsCount - 1);
        targetProfile.friendsCount = Math.max(0, targetProfile.friendsCount - 1);
      }

      await userProfile.save();
      await targetProfile.save();
      return { userProfile, targetProfile };
    } catch (error) {
      throw new Error('Lỗi khi unfollow: ' + error.message);
    }
  }

  async addPostToProfile(userId, postId) {
    try {
      const profile = await Profile.findOne({ userId });
      if (!profile) throw new Error('Không tìm thấy profile');

      if (!profile.posts.includes(postId)) {
        profile.posts.push(postId);
      }
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error('Lỗi khi thêm bài viết: ' + error.message);
    }
  }

  // Thêm hàm cập nhật trạng thái online/offline
  async updateOnlineStatus(userId, isOnline) {
    try {
      const profile = await Profile.findOne({ userId });
      if (!profile) throw new Error('Không tìm thấy profile');

      profile.isOnline = isOnline;
      profile.lastSeen = isOnline ? null : new Date();
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error('Lỗi khi cập nhật trạng thái online: ' + error.message);
    }
  }
}

module.exports = new ProfileService();