// backend/controllers/alert.js
const Alert = require('../models/alert');

exports.createAlert = (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'farmer') {
        return res.status(403).json({ msg: 'Only farmers or admins can create alerts' });
    }

    const { message, type } = req.body;
    if (!message) return res.status(400).json({ msg: 'Message is required' });

    const user_id = req.user.role === 'admin' ? null : req.user.id;

    Alert.create({ message, type: type || 'other', user_id }, (err, result) => {
        if (err) return res.status(500).json({ msg: 'Error creating alert' });

        const alert_id = result.insertId;

        // Fetch the created alert with username for real-time emit
        Alert.getById(alert_id, (err, newAlertRows) => {
            const newAlert = newAlertRows[0];

            req.io.emit('newAlert', {
                ...newAlert,
                username: newAlert.username || 'Admin'
            });

            res.status(201).json({ msg: 'Alert created!', alert: newAlert });
        });
    });
};

exports.getAlerts = (req, res) => {
    Alert.getAll((err, results) => {
        if (err) return res.status(500).json({ msg: 'Server error' });
        // Ensure username is 'Admin' if null
        const formatted = results.map(a => ({
            ...a,
            username: a.username || 'Admin'
        }));
        res.json(formatted);
    });
};

// New: Delete alert (only creator or admin)
exports.deleteAlert = (req, res) => {
    const alertId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    Alert.getById(alertId, (err, rows) => {
        if (err || rows.length === 0) return res.status(404).json({ msg: 'Alert not found' });

        const alert = rows[0];
        if (!isAdmin && alert.user_id !== userId) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        Alert.delete(alertId, (err) => {
            if (err) return res.status(500).json({ msg: 'Delete failed' });
            req.io.emit('alertDeleted', { id: alertId });
            res.json({ msg: 'Alert deleted' });
        });
    });
};