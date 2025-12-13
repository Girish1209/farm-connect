const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs');

exports.register = (req, res) => {
    const { username, email, password, role } = req.body;
    User.findByEmail(email, (err, results) => {
        if (results && results.length > 0) return res.status(400).json({ msg: 'User already exists' });

        User.create({ username, email, password, role }, (err, result) => {
            if (err) return res.status(500).json({ msg: 'Server error' });
            res.status(201).json({ msg: 'User registered successfully!' });
        });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;
    User.findByEmail(email, (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ msg: 'Invalid credentials' });

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, msg: 'Login successful!' });
        });
    });
};