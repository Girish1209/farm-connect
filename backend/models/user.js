const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    create: (newUser, callback) => {
        bcrypt.hash(newUser.password, 10, (err, hash) => {
            if (err) return callback(err);
            const sql = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;
            db.query(sql, [newUser.username, newUser.email, hash, newUser.role || 'buyer'], callback);
        });
    },
    findByEmail: (email, callback) => {
        const sql = `SELECT * FROM users WHERE email = ?`;
        db.query(sql, [email], callback);
    },
    findById: (id, callback) => {
        const sql = `SELECT * FROM users WHERE id = ?`;
        db.query(sql, [id], callback);
    }
};

module.exports = User;