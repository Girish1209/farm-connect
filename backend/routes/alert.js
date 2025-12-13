const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, alertController.createAlert);
router.get('/', alertController.getAlerts);

module.exports = router;