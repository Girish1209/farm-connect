const Forum = require('../models/forum');

exports.createPost = (req, res) => {
    const { title, content } = req.body;
    const user_id = req.user.id;

    Forum.createPost({ title, content, user_id }, (err, result) => {
        if (err) return res.status(500).json({ msg: 'Error creating post' });
        
        const postId = result.insertId;
        // We will emit socket event later
        res.status(201).json({ msg: 'Post created!', post_id: postId });
    });
};

exports.getPosts = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const search = req.query.search || '';

    Forum.getAllPosts(page, limit, search, (err, results) => {
        if (err) return res.status(500).json({ msg: 'Server error' });
        res.json(results);
    });
};

exports.addComment = (req, res) => {
    const { content } = req.body;
    const { post_id } = req.params;
    const user_id = req.user.id;
    req.io.emit('newComment', newComment);  // We will pass io later

    Forum.createComment({ content, user_id, post_id }, (err, result) => {
        if (err) return res.status(500).json({ msg: 'Error adding comment' });
        
        // Get the comment with username
        Forum.getCommentsByPost(post_id, (err, comments) => {
            const newComment = comments[comments.length - 1];
            // We will emit this via socket
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