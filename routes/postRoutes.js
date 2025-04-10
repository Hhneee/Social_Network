const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');


// Các route yêu cầu xác thực
router.post('/create', auth, postController.createPost);
router.post('/:postId/like', auth, postController.likePost);
router.post('/:postId/comment', auth, postController.commentPost);
router.post('/:postId/share', auth, postController.sharePost);
router.get('/:postId/comments', auth, postController.getPostComments);
router.get('/:userId', auth, postController.getUserPosts);
// Route không yêu cầu xác thực
router.get('/', postController.getPosts);

module.exports = router;