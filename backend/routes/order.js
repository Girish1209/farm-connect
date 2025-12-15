const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, orderController.placeOrder);
router.get('/my', authMiddleware, orderController.getMyOrders);
router.get('/:id', authMiddleware, orderController.getOrderDetails);
router.patch('/:id/status', authMiddleware, orderController.updateOrderStatus);
router.get('/farmer/revenue', authMiddleware, orderController.getFarmerRevenue);

module.exports = router;