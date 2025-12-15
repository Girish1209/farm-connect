const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const authMiddleware = require('../middleware/auth');

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.post('/profile/pic', authMiddleware, userController.uploadProfilePic);

module.exports = router;