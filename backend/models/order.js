const db = require('../config/db');

const Order = {
    create: (newOrder, callback) => {
        // First create order
        const sql = `INSERT INTO orders (buyer_id, crop_id, quantity, total_price) VALUES (?, ?, ?, ?)`;
        db.query(sql, [newOrder.buyer_id, newOrder.crop_id, newOrder.quantity, newOrder.total_price], (err, result) => {
            if (err) return callback(err);

            const orderId = result.insertId;
            const orderNumber = `ORD-${String(orderId).padStart(6, '0')}`;

            // Update with order_number
            db.query(`UPDATE orders SET order_number = ? WHERE id = ?`, [orderNumber, orderId], (err) => {
                if (err) return callback(err);
                callback(null, { insertId: orderId, order_number: orderNumber });
            });
        });
    },

    findByUser: (user_id, role, page = 1, limit = 10, status = '', callback) => {
        const offset = (page - 1) * limit;
        let sql = `
            SELECT o.id, o.order_number, o.quantity, o.total_price, o.status, o.created_at,
                   c.name AS crop_name, c.image_path, c.price AS unit_price,
                   u.username AS ${role === 'farmer' ? 'buyer_name' : 'farmer_name'}
            FROM orders o 
            JOIN crops c ON o.crop_id = c.id 
            ${role === 'farmer' ? 'JOIN users u ON o.buyer_id = u.id' : 'JOIN users u ON c.farmer_id = u.id'}
            WHERE ${role === 'farmer' ? 'c.farmer_id' : 'o.buyer_id'} = ?
        `;
        const params = [user_id];

        if (status && status !== 'all') {
            sql += ` AND o.status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        db.query(sql, params, callback);
    },

    findById: (order_id, callback) => {
        const sql = `
            SELECT o.*, o.order_number,
                   c.name AS crop_name, c.description, c.image_path, c.price AS unit_price,
                   buyer.username AS buyer_name, buyer.email AS buyer_email,
                   farmer.username AS farmer_name
            FROM orders o
            JOIN crops c ON o.crop_id = c.id
            JOIN users buyer ON o.buyer_id = buyer.id
            JOIN users farmer ON c.farmer_id = farmer.id
            WHERE o.id = ?
        `;
        db.query(sql, [order_id], callback);
    },

    updateStatus: (order_id, status, user_id, user_role, callback) => {
        // Validate status
        const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) return callback(new Error('Invalid status'));

        let sql = `UPDATE orders SET status = ? WHERE id = ?`;
        let params = [status, order_id];

        if (user_role !== 'admin') {
            // Non-admin can only update if they are buyer (cancel pending) or farmer (ship/deliver)
            if (status === 'cancelled') {
                sql += ` AND buyer_id = ? AND status = 'pending'`;
            } else {
                sql += ` AND EXISTS (SELECT 1 FROM crops WHERE id = (SELECT crop_id FROM orders WHERE id = ?) AND farmer_id = ?)`;
                params.push(order_id, user_id);
            }
            params.push(user_id);
        }

        db.query(sql, params, callback);
    },

    getFarmerRevenue: (farmer_id, callback) => {
        const sql = `
            SELECT COALESCE(SUM(o.total_price), 0) AS total_revenue, COUNT(*) AS total_orders
            FROM orders o
            JOIN crops c ON o.crop_id = c.id
            WHERE c.farmer_id = ? AND o.status != 'cancelled'
        `;
        db.query(sql, [farmer_id], callback);
    }
};

module.exports = Order;