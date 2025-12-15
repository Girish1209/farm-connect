const db = require('../config/db');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// Multer setup for profile pic
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'profile_' + req.user.id + '_' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Get current user profile
exports.getProfile = (req, res) => {
    const userId = req.user.id;
    const sql = `SELECT id, username, email, role, profile_pic, bio FROM users WHERE id = ?`;
    db.query(sql, [userId], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ msg: 'User not found' });
        res.json(results[0]);
    });
};

// Update profile (username, bio)
exports.updateProfile = (req, res) => {
    const userId = req.user.id;
    const { username, bio } = req.body;

    const sql = `UPDATE users SET username = ?, bio = ? WHERE id = ?`;
    db.query(sql, [username, bio, userId], (err, result) => {
        if (err) return res.status(500).json({ msg: 'Update failed' });
        res.json({ msg: 'Profile updated successfully' });
    });
};

// Upload profile picture
exports.uploadProfilePic = [upload.single('profile_pic'), (req, res) => {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const profilePicPath = `/uploads/${req.file.filename}`;

    const sql = `UPDATE users SET profile_pic = ? WHERE id = ?`;
    db.query(sql, [profilePicPath, userId], (err) => {
        if (err) return res.status(500).json({ msg: 'Upload failed' });
        res.json({ msg: 'Profile picture updated', profile_pic: profilePicPath });
    });
}];