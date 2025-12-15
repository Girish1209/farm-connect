// backend/models/alert.js
const db = require('../config/db');

const Alert = {
    create: (newAlert, callback) => {
        const sql = `INSERT INTO alerts (message, type, priority, image_path, user_id) VALUES (?, ?, ?, ?, ?)`;
        db.query(sql, [newAlert.message, newAlert.type, newAlert.priority || 'normal', newAlert.image_path, newAlert.user_id], callback);
    },
    getAll: (callback) => {
        const sql = `
            SELECT a.*, u.username 
            FROM alerts a 
            LEFT JOIN users u ON a.user_id = u.id 
            ORDER BY a.created_at DESC 
            LIMIT 50
        `;
        db.query(sql, callback);
    },
    getById: (id, callback) => {
        const sql = `
            SELECT a.*, u.username 
            FROM alerts a 
            LEFT JOIN users u ON a.user_id = u.id 
            WHERE a.id = ?
        `;
        db.query(sql, [id], callback);
    },
    delete: (id, callback) => {
        const sql = `DELETE FROM alerts WHERE id = ?`;
        db.query(sql, [id], callback);
    }
};


module.exports = Alert;