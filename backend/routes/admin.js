const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const authMiddleware = require('../middleware/auth');

router.get('/stats', authMiddleware, adminController.getStats);
router.get('/top-crops', authMiddleware, adminController.getTopCrops);
router.get('/recent-orders', authMiddleware, adminController.getRecentOrders);
router.get('/users', authMiddleware, adminController.getUsers);

module.exports = router;