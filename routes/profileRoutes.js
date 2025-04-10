const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.post('/create', profileController.createProfile);
router.get('/profile-user/:userId', profileController.getProfileByUserId);
router.get('/:username', profileController.getProfileByUsername);
router.put('/update', profileController.updateProfile);
router.post('/follow', profileController.followUser);
router.post('/unfollow', profileController.unfollowUser);
router.post('/add-post', profileController.addPostToProfile);
router.post('/update-online', profileController.updateOnlineStatus); // Thêm route mới

module.exports = router;