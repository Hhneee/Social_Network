const PostService = require('../services/postService');

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

const likePost = async (req, res) => {
    try{
        const {postId} = req.params;
        const userId = req.user._id;
        const post = await PostService.likePost(userId, postId);
        res.status(200).json({message: 'Bài viết đã được thích', post});
    }catch(error){
        res.status(400).json({message: error.message});
    }
};

const commentPost = async (req, res) => {
    try{
        const {postId} = req.params;
        const {content} = req.body;
        const userId = req.user._id;
        const post = await PostService.commentPost(userId, postId, {content});
        res.status(200).json({message: 'Bình luận đã được thêm', post});
    }catch(error){
        res.status(400).json({message: error.message});
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

module.exports = { createPost, likePost, commentPost, sharePost, getPosts };