const db = require('../config/db');

const Alert = {
    create: (newAlert, callback) => {
        const sql = `INSERT INTO alerts (message, type, user_id) VALUES (?, ?, ?)`;
        db.query(sql, [newAlert.message, newAlert.type, newAlert.user_id || null], callback);
    },
    getAll: (callback) => {
        const sql = `
            SELECT a.*, u.username 
            FROM alerts a 
            LEFT JOIN users u ON a.user_id = u.id 
            ORDER BY a.created_at DESC 
            LIMIT 20
        `;
        db.query(sql, callback);
    }
};

module.exports = Alert;