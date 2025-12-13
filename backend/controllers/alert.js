const Alert = require('../models/alert');

exports.createAlert = (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'farmer') {
        return res.status(403).json({ msg: 'Only farmers or admins can create alerts' });
    }

    const { message, type } = req.body;
    const user_id = req.user.role === 'admin' ? null : req.user.id; // Global if admin

    Alert.create({ message, type: type || 'other', user_id }, (err, result) => {
        if (err) return res.status(500).json({ msg: 'Error creating alert' });

        const alert_id = result.insertId;

        // Emit real-time alert (with basic info)
        const newAlert = {
            id: alert_id,
            message,
            type: type || 'other',
            username: req.user.role === 'admin' ? 'Admin' : null,
            created_at: new Date().toISOString()
        };
        req.io.emit('newAlert', newAlert);

        res.status(201).json({ msg: 'Alert created!', alert_id });
    });
};

exports.getAlerts = (req, res) => {
    Alert.getAll((err, results) => {
        if (err) return res.status(500).json({ msg: 'Server error' });
        res.json(results);
    });
};