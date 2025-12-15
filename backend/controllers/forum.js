const Forum = require('../models/forum');

exports.createPost = (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ msg: 'Title and content required' });

    Forum.createPost({ title, content, user_id: req.user.id }, (err, result) => {
        if (err) return res.status(500).json({ msg: 'Error creating post' });
        res.status(201).json({ msg: 'Post created!', post_id: result.insertId });
    });
};

exports.getPosts = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || '';

    Forum.getAllPosts(page, 10, search, (err, results) => {
        if (err) return res.status(500).json({ msg: 'Server error' });
        res.json(results);
    });
};

exports.addComment = (req, res) => {
    const { content, parent_id } = req.body;
    const { post_id } = req.params;

    if (!content) return res.status(400).json({ msg: 'Content required' });

    Forum.createComment({ content, user_id: req.user.id, post_id, parent_id }, (err, result) => {
        if (err) return res.status(500).json({ msg: 'Error adding comment' });

        Forum.getCommentsByPost(post_id, (err, comments) => {
            const newComment = comments.find(c => c.id === result.insertId);
            req.io.emit('newComment', { post_id, comment: newComment });
            res.status(201).json({ msg: 'Comment added!', comment: newComment });
        });
    });
};

exports.getComments = (req, res) => {
    const { post_id } = req.params;
    Forum.getCommentsByPost(post_id, (err, results) => {
        if (err) return res.status(500).json({ msg: 'Server error' });
        res.json(results);
    });
};

exports.likePost = (req, res) => {
    Forum.likePost(req.params.id, (err) => {
        if (err) return res.status(500).json({ msg: 'Like failed' });
        res.json({ msg: 'Post liked!' });
    });
};

exports.likeComment = (req, res) => {
    Forum.likeComment(req.params.id, (err) => {
        if (err) return res.status(500).json({ msg: 'Like failed' });
        res.json({ msg: 'Comment liked!' });
    });
};

exports.deletePost = (req, res) => {
    Forum.deletePost(req.params.id, req.user.id, (err) => {
        if (err) return res.status(500).json({ msg: 'Delete failed' });
        res.json({ msg: 'Post deleted' });
    });
};

exports.deleteComment = (req, res) => {
    Forum.deleteComment(req.params.id, req.user.id, (err) => {
        if (err) return res.status(500).json({ msg: 'Delete failed' });
        res.json({ msg: 'Comment deleted' });
    });
};