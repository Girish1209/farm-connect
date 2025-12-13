const db = require('../config/db');

const Order = {
    create: (newOrder, callback) => {
        const sql = `INSERT INTO orders (buyer_id, crop_id, quantity, total_price) VALUES (?, ?, ?, ?)`;
        db.query(sql, [newOrder.buyer_id, newOrder.crop_id, newOrder.quantity, newOrder.total_price], callback);
    },
    findByUser: (user_id, page = 1, limit = 10, callback) => {
        const offset = (page - 1) * limit;
        const sql = `
            SELECT o.*, c.name AS crop_name, c.image_path 
            FROM orders o 
            JOIN crops c ON o.crop_id = c.id 
            WHERE o.buyer_id = ? OR c.farmer_id = ?
            ORDER BY o.created_at DESC 
            LIMIT ? OFFSET ?
        `;
        db.query(sql, [user_id, user_id, limit, offset], callback);
    },
    updateStatus: (order_id, status, user_role, farmer_id_check, callback) => {
        let sql = `UPDATE orders SET status = ? WHERE id = ?`;
        let params = [status, order_id];
        
        if (user_role !== 'admin') {
            sql += ` AND (SELECT farmer_id FROM crops WHERE id = (SELECT crop_id FROM orders WHERE id = ?)) = ?`;
            params = [status, order_id, order_id, farmer_id_check];
        }
        
        db.query(sql, params, callback);
    }
};

module.exports = Order;