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
exports.updateCrop = [authMiddleware, upload.single('image'), (req, res) => {
    if (req.user.role !== 'farmer') return res.status(403).json({ msg: 'Only farmers' });

    const cropId = req.params.id;
    const image_path = req.file ? `/uploads/${req.file.filename}` : req.body.existing_image;

    const updatedCrop = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        quantity_available: req.body.quantity_available,
        image_path,
        farmer_id: req.user.id
    };

    Crop.update(cropId, updatedCrop, (err) => {
        if (err) return res.status(500).json({ msg: 'Update failed' });
        res.json({ msg: 'Crop updated!' });
    });
}];

exports.deleteCrop = (req, res) => {
    if (req.user.role !== 'farmer') return res.status(403).json({ msg: 'Only farmers' });
    
    Crop.delete(req.params.id, req.user.id, (err) => {
        if (err) return res.status(500).json({ msg: 'Delete failed' });
        res.json({ msg: 'Crop deleted' });
    });
};

exports.getAllCrops = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const search = req.query.search || '';
    const category = req.query.category || '';

    Crop.findAll(page, limit, search, category, (err, results) => {
        if (err) {
            console.error('getAllCrops error:', err);
            return res.status(500).json({ msg: 'Server error loading crops' });
        }
        res.json(results);
    });
};

// You can add getById, update, delete later if time