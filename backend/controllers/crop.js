const Crop = require('../models/crop');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

exports.addCrop = [authMiddleware, upload.single('image'), (req, res) => {
    if (req.user.role !== 'farmer') return res.status(403).json({ msg: 'Only farmers can add crops' });
    
    const image_path = req.file ? `/uploads/${req.file.filename}` : null;
    const newCrop = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        quantity_available: req.body.quantity_available,
        image_path,
        farmer_id: req.user.id
    };
    
    Crop.create(newCrop, (err, result) => {
        if (err) return res.status(500).json({ msg: 'Error adding crop' });
        res.status(201).json({ msg: 'Crop added successfully!', crop_id: result.insertId });
    });
}];

// Add more: getAll, getById, update, delete (similar, with role checks)
exports.getAllCrops = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    Crop.findAll(page, limit, search, (err, results) => {
        if (err) return res.status(500).json({ msg: 'Server error' });
        res.json(results);
    });
};

// You can add getById, update, delete later if time