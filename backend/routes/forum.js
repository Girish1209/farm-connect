const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forum');
const authMiddleware = require('../middleware/auth');

router.post('/posts', authMiddleware, forumController.createPost);
router.get('/posts', forumController.getPosts);
router.post('/posts/:post_id/comments', authMiddleware, forumController.addComment);
router.get('/posts/:post_id/comments', forumController.getComments);
router.post('/posts/:post_id/comments', authMiddleware, forumController.addComment);
router.post('/posts/:id/like', authMiddleware, forumController.likePost);
router.post('/comments/:id/like', authMiddleware, forumController.likeComment);
router.delete('/posts/:id', authMiddleware, forumController.deletePost);
router.delete('/comments/:id', authMiddleware, forumController.deleteComment);

module.exports = router;