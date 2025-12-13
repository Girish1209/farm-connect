const Order = require('../models/order');
const Crop = require('../models/crop');
const { sendOrderEmail } = require('../config/email');
const db = require('../config/db');

exports.placeOrder = (req, res) => {
    const buyer_id = req.user.id;
    const { crop_id, quantity } = req.body;

    Crop.findById(crop_id, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ msg: 'Crop not found' });
        
        const crop = results[0];
        if (crop.quantity_available < quantity) return res.status(400).json({ msg: 'Not enough quantity' });

        const total_price = crop.price * quantity;

        const newOrder = { buyer_id, crop_id, quantity, total_price };
        
        Order.create(newOrder, (err, result) => {
            if (err) return res.status(500).json({ msg: 'Order failed' });

            // Reduce crop quantity
            const updatedQty = crop.quantity_available - quantity;
            const updateCrop = { ...crop, quantity_available: updatedQty };
            Crop.update(crop_id, updateCrop, () => {});

            // Send emails
            sendOrderEmail(crop.farmer_id, `New Order! #${result.insertId}`, `You have a new order for ${quantity} ${crop.name}! Total: $${total_price}`);
            
            // You need buyer email – we add a simple query
            const getBuyerEmail = `SELECT email FROM users WHERE id = ?`;
            db.query(getBuyerEmail, [buyer_id], (err, userRes) => {
                if (userRes && userRes[0]) {
                    sendOrderEmail(userRes[0].email, 'Order Confirmed!', `Your order for ${quantity} ${crop.name} is placed! Total: $${total_price}. Thank you!`);
                }
            });

            res.status(201).json({ msg: 'Order placed successfully!', order_id: result.insertId });
        });
    });
};

exports.getMyOrders = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    Order.findByUser(req.user.id, page, limit, (err, results) => {
        if (err) return res.status(500).json({ msg: 'Server error' });
        res.json(results);
    });
};