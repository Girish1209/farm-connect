const db = require('../config/db');

exports.getStats = (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });

    const stats = {};

    db.query('SELECT COUNT(*) AS totalUsers FROM users', (err, res1) => {
        if (err) return res.status(500).json({ msg: 'Error' });
        stats.totalUsers = res1[0].totalUsers;

        db.query('SELECT COUNT(*) AS activeCrops FROM crops', (err, res2) => {
            if (err) return res.status(500).json({ msg: 'Error' });
            stats.activeCrops = res2[0].activeCrops;

            const today = new Date().toISOString().slice(0, 10);
            db.query(`SELECT COUNT(*) AS ordersToday, COALESCE(SUM(total_price), 0) AS revenueToday FROM orders WHERE DATE(created_at) = ?`, [today], (err, res3) => {
                if (err) return res.status(500).json({ msg: 'Error' });
                stats.ordersToday = res3[0].ordersToday;
                stats.revenueToday = parseFloat(res3[0].revenueToday);

                db.query(`SELECT COALESCE(SUM(total_price), 0) AS totalRevenue FROM orders`, (err, res4) => {
                    if (err) return res.status(500).json({ msg: 'Error' });
                    stats.totalRevenue = parseFloat(res4[0].totalRevenue);

                    res.json(stats);
                });
            });
        });
    });
};
exports.getTopCrops = (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });

    const sql = `
        SELECT c.name, SUM(o.quantity) AS total_sold, SUM(o.total_price) AS total_revenue
        FROM orders o
        JOIN crops c ON o.crop_id = c.id
        GROUP BY o.crop_id
        ORDER BY total_sold DESC
        LIMIT 5
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ msg: 'Error fetching top crops' });
        res.json(results);
    });
};
// Recent orders with details
exports.getRecentOrders = (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });

    const sql = `
        SELECT o.id, o.quantity, o.total_price, o.status, o.created_at,
               c.name AS crop_name, u.username AS buyer_name
        FROM orders o
        JOIN crops c ON o.crop_id = c.id
        JOIN users u ON o.buyer_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 10
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ msg: 'Error' });
        res.json(results);
    });
};

// List all users
exports.getUsers = (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });

    const sql = `SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ msg: 'Error' });
        res.json(results);
    });
};