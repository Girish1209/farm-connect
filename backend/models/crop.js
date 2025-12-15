const db = require('../config/db');

const Crop = {
    // Create new crop
    create: (newCrop, callback) => {
        const sql = `
            INSERT INTO crops 
            (name, description, category, price, quantity_available, image_path, farmer_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(
            sql,
            [
                newCrop.name,
                newCrop.description || null,
                newCrop.category || 'other',
                newCrop.price,
                newCrop.quantity_available,
                newCrop.image_path || null,
                newCrop.farmer_id
            ],
            callback
        );
    },

    // Get all crops with search, category filter, pagination, and farmer name
    findAll: (page = 1, limit = 9, search = '', category = '', callback) => {
        const offset = (page - 1) * limit;

        let sql = `
            SELECT c.*, u.username AS farmer_name 
            FROM crops c 
            JOIN users u ON c.farmer_id = u.id 
            WHERE 1=1
        `;
        const params = [];

        // Only add search if provided and not empty
        if (search && search.trim() !== '') {
            sql += ` AND c.name LIKE ?`;
            params.push(`%${search.trim()}%`);
        }

        // Only add category filter if provided and not empty
        if (category && category.trim() !== '') {
            sql += ` AND c.category = ?`;
            params.push(category.trim());
        }

        sql += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('findAll error:', err);
                return callback(err);
            }
            callback(null, results || []);
        });
    },

    // Get crops by farmer ID (for dashboard)
    getByFarmer: (farmer_id, callback) => {
        const sql = `
            SELECT c.*, u.username AS farmer_name 
            FROM crops c 
            JOIN users u ON c.farmer_id = u.id 
            WHERE c.farmer_id = ? 
            ORDER BY c.created_at DESC
        `;
        db.query(sql, [farmer_id], callback);
    },

    // Find single crop by ID
    findById: (id, callback) => {
        const sql = `
            SELECT c.*, u.username AS farmer_name 
            FROM crops c 
            JOIN users u ON c.farmer_id = u.id 
            WHERE c.id = ?
        `;
        db.query(sql, [id], callback);
    },

    // Update crop (with optional image)
    update: (id, updatedCrop, callback) => {
        const sql = `
            UPDATE crops 
            SET name = ?, 
                description = ?, 
                category = ?, 
                price = ?, 
                quantity_available = ?, 
                image_path = COALESCE(?, image_path)
            WHERE id = ? AND farmer_id = ?
        `;
        db.query(
            sql,
            [
                updatedCrop.name,
                updatedCrop.description || null,
                updatedCrop.category || 'other',
                updatedCrop.price,
                updatedCrop.quantity_available,
                updatedCrop.image_path, // can be null to keep old
                id,
                updatedCrop.farmer_id
            ],
            callback
        );
    },

    // Delete crop (only by owner)
    delete: (id, farmer_id, callback) => {
        const sql = `DELETE FROM crops WHERE id = ? AND farmer_id = ?`;
        db.query(sql, [id, farmer_id], callback);
    }
};

module.exports = Crop;