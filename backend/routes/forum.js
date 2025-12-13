const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forum');
const authMiddleware = require('../middleware/auth');

router.post('/posts', authMiddleware, forumController.createPost);
router.get('/posts', forumController.getPosts);
router.post('/posts/:post_id/comments', authMiddleware, forumController.addComment);
router.get('/posts/:post_id/comments', forumController.getComments);

module.exports = router;