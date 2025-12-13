const express = require('express');
const router = express.Router();
const cropController = require('../controllers/crop');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, cropController.addCrop);
router.get('/', cropController.getAllCrops);
// Add more routes later: router.get('/:id'), put, delete

module.exports = router;