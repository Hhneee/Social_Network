const PostService = require('../services/postService');
const Post = require('../models/postModel');
const notificationService = require('../services/notificationService');

const createPost = async (req, res) => {
    try {
        console.log('req.user:', req.user); // Thêm dòng này
        const {content, media} = req.body;
        const userId = req.user._id;
        const post = await PostService.createPost(userId, {content, media});
        res.status(201).json({message:'Bài viết đã được tạo ',post});
    } catch(error) {
        res.status(400).json({message: error.message});
    }
};

const toggleLike = async (postId, userId) => {
    const post = await Post.findById(postId);
    if (!post) return false;
  
    const alreadyLiked = post.likes.includes(userId);
  
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }
  
    await post.save();
    return !alreadyLiked;
  };
  // Ví dụ: likePostController.js
  const likePost = async (req, res) => {
      const { postId } = req.params;
      const userId = req.user._id;
    
      // Populate user để truy cập được post.user._id
      const post = await Post.findById(postId).populate('user');
      if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    
      const liked = await toggleLike(postId, userId);
    
      // post.user là người tạo bài viết
      if (liked && userId.toString() !== post.user._id.toString()) {
        await notificationService.createNotification({
          recipient: post.user._id,
          sender: userId,
          type: 'like',
          message: `${req.user.username} đã thích bài viết của bạn.`,
          link: `/posts/${postId}`,
        });
      }
    
      res.json({ success: true, liked });
    };
    
    const commentPost = async (req, res) => {
        try {
            const { postId } = req.params;
            const { content } = req.body;
            const userId = req.user._id;
    
            const post = await PostService.commentPost(userId, postId, { content });
    
            const fullPost = await Post.findById(postId).populate('user');
            console.log('>> fullPost.user:', fullPost.user);
    
            if (userId.toString() !== fullPost.user._id.toString()) {
                await notificationService.createNotification({
                    recipient: fullPost.user._id,
                    sender: userId,
                    type: 'comment',
                    message: `${req.user.username} đã bình luận về bài viết của bạn.`,
                    link: `/posts/${postId}`,
                });
            }
    
            res.status(200).json({ message: 'Bình luận đã được thêm', post });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    };
      

const sharePost = async (req, res) => {
    try{
        const {postId} = req.params;
        const userId = req.user._id;
        const post = await PostService.sharePost(userId, postId);
        res.status(200).json({message: 'Bài viết đã được chia sẻ', post});
    }catch(error){
        res.status(400).json({message: error.message});
    }
};

const getPosts = async (req, res) => {
    try{
        const posts = await PostService.getPosts();
        res.status(200).json({message: 'Danh sách bài viết', posts});
    }catch(error){
        res.status(400).json({message: error.message});
    }
}


const getPostComments = async (req, res) => {
    try {
      const { postId } = req.params;
      const post = await PostService.getPostComments(postId); // Thêm hàm này vào PostService
      res.status(200).json(post.comments);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
module.exports = { createPost, likePost, commentPost, sharePost, getPosts, getPostComments };
