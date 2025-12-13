const db = require('../config/db');

const Crop = {
    create: (newCrop, callback) => {
        const sql = `INSERT INTO crops (name, description, price, quantity_available, image_path, farmer_id) VALUES (?, ?, ?, ?, ?, ?)`;
        db.query(sql, [newCrop.name, newCrop.description, newCrop.price, newCrop.quantity_available, newCrop.image_path, newCrop.farmer_id], callback);
    },
    findAll: (page = 1, limit = 10, search = '', callback) => {
        const offset = (page - 1) * limit;
        let sql = `SELECT * FROM crops WHERE name LIKE ? LIMIT ? OFFSET ?`;
        db.query(sql, [`%${search}%`, limit, offset], callback);
    },
    findById: (id, callback) => {
        const sql = `SELECT * FROM crops WHERE id = ?`;
        db.query(sql, [id], callback);
    },
    findByFarmerId: (farmer_id, callback) => {
        const sql = `SELECT * FROM crops WHERE farmer_id = ?`;
        db.query(sql, [farmer_id], callback);
    },
    update: (id, updatedCrop, callback) => {
        const sql = `UPDATE crops SET name=?, description=?, price=?, quantity_available=?, image_path=? WHERE id=? AND farmer_id=?`;
        db.query(sql, [updatedCrop.name, updatedCrop.description, updatedCrop.price, updatedCrop.quantity_available, updatedCrop.image_path, id, updatedCrop.farmer_id], callback);
    },
    delete: (id, farmer_id, callback) => {
        const sql = `DELETE FROM crops WHERE id=? AND farmer_id=?`;
        db.query(sql, [id, farmer_id], callback);
    }
};

module.exports = Crop;