const db = require('../config/db');

const Forum = {
    createPost: (newPost, callback) => {
        const sql = `INSERT INTO forum_posts (title, content, user_id) VALUES (?, ?, ?)`;
        db.query(sql, [newPost.title, newPost.content, newPost.user_id], callback);
    },

    getAllPosts: (page = 1, limit = 10, search = '', callback) => {
        const offset = (page - 1) * limit;
        let sql = `
            SELECT p.*, u.username, 
                   (SELECT COUNT(*) FROM forum_comments WHERE post_id = p.id) AS comment_count
            FROM forum_posts p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.title LIKE ? OR p.content LIKE ?
            ORDER BY p.created_at DESC 
            LIMIT ? OFFSET ?
        `;
        db.query(sql, [`%${search}%`, `%${search}%`, limit, offset], callback);
    },

    createComment: (newComment, callback) => {
        const sql = `INSERT INTO forum_comments (content, user_id, post_id, parent_id) VALUES (?, ?, ?, ?)`;
        db.query(sql, [newComment.content, newComment.user_id, newComment.post_id, newComment.parent_id || null], callback);
    },

    getCommentsByPost: (post_id, callback) => {
        const sql = `
            SELECT c.*, u.username,
                   (SELECT COUNT(*) FROM forum_comments WHERE parent_id = c.id) AS reply_count
            FROM forum_comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.post_id = ? 
            ORDER BY c.created_at ASC
        `;
        db.query(sql, [post_id], callback);
    },

    likePost: (post_id, callback) => {
        const sql = `UPDATE forum_posts SET likes = likes + 1 WHERE id = ?`;
        db.query(sql, [post_id], callback);
    },

    likeComment: (comment_id, callback) => {
        const sql = `UPDATE forum_comments SET likes = likes + 1 WHERE id = ?`;
        db.query(sql, [comment_id], callback);
    },

    deletePost: (post_id, user_id, callback) => {
        const sql = `DELETE FROM forum_posts WHERE id = ? AND user_id = ?`;
        db.query(sql, [post_id, user_id], callback);
    },

    deleteComment: (comment_id, user_id, callback) => {
        const sql = `DELETE FROM forum_comments WHERE id = ? AND user_id = ?`;
        db.query(sql, [comment_id, user_id], callback);
    }
};

module.exports = Forum;