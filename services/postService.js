const Post = require('../models/postModel');

class PostService {
    async createPost(userId, {content, media}) {
        const post = await Post.create({
            user: userId,
            content,
            media: media.map(item => ({type: item.type, url: item.url})),
            likes: [],
            comments: [],
            shares: [],
        });
        return post;
    }

    //THem luot thich bai viet
    async likePost(userId, postId) {
        const post = await Post.findById(postId);
        if (!post) {
            throw new Error('Bài viết không tồn tại');
        }
        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        }else{
            post.likes.push(userId);
        }
        await post.save();
        return post;
    }

    //them binh luan bai viet
    async commentPost(userId, postId, {content}) {
        const post = await Post.findById(postId);
        if (!post) {
            throw new Error('Bài viết không tồn tại');
        }
        post.comments.push({user: userId, content});
        await post.save();
        return post;
    }

    //chia se bai viet
    async sharePost(userId, postId) {
        const post = await Post.findById(postId);
        if (!post) 
            throw new Error('Bài viết không tồn tại');
        
        if (!post.shares.includes(userId)) {
            post.shares.push(userId);
        }
        await post.save();
        return post;
    }

    //lay tat ca bai viet
    async getPosts() {
        const posts = await Post.find()
            .populate('user', 'username email')
            .populate('comments.user', 'username')
            .sort({createdAt: -1});
        return posts;
    }
}

module.exports = new PostService();



