const express = require('express');
const router = express.Router();
const cropController = require('../controllers/crop');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, cropController.addCrop);
router.get('/', cropController.getAllCrops);
router.put('/:id', authMiddleware, cropController.updateCrop);
router.delete('/:id', authMiddleware, cropController.deleteCrop);

module.exports = router;