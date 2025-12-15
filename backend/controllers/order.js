const Order = require('../models/order');
const Crop = require('../models/crop');
const { sendOrderEmail } = require('../config/email');
const db = require('../config/db');  // ADD THIS LINE!

exports.placeOrder = (req, res) => {
    const buyer_id = req.user.id;
    const { crop_id, quantity } = req.body;

    if (!crop_id || !quantity || quantity <= 0) {
        return res.status(400).json({ msg: 'Invalid order data' });
    }

    Crop.findById(crop_id, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ msg: 'Crop not found' });
        
        const crop = results[0];
        if (crop.quantity_available < quantity) return res.status(400).json({ msg: 'Not enough stock' });

        const total_price = (crop.price * quantity).toFixed(2);

        const newOrder = { buyer_id, crop_id, quantity, total_price };

        Order.create(newOrder, (err, result) => {
            if (err) return res.status(500).json({ msg: 'Order failed' });

            // Reduce stock
            Crop.update(crop_id, { ...crop, quantity_available: crop.quantity_available - quantity }, () => {});

            // Send emails with better template
            const orderNumber = result.order_number;
            const buyerEmailQuery = `SELECT email, username FROM users WHERE id = ?`;
            const farmerEmailQuery = `SELECT email FROM users WHERE id = ?`;

            db.query(buyerEmailQuery, [buyer_id], (err, buyerRes) => {
                if (buyerRes[0]) {
                    sendOrderEmail(
                        buyerRes[0].email,
                        `Order Confirmed - ${orderNumber}`,
                        `Hi ${buyerRes[0].username},\n\nYour order for ${quantity} x ${crop.name} has been placed!\nTotal: ₹${total_price}\nOrder #: ${orderNumber}\n\nThank you for supporting local farmers!\n\nFarm Connect Team`
                    );
                }
            });

            db.query(farmerEmailQuery, [crop.farmer_id], (err, farmerRes) => {
                if (farmerRes[0]) {
                    sendOrderEmail(
                        farmerRes[0].email,
                        `New Order Received - ${orderNumber}`,
                        `New order!\n\n${quantity} x ${crop.name}\nBuyer ID: ${buyer_id}\nTotal: ₹${total_price}\nOrder #: ${orderNumber}\n\nPlease prepare for shipping.`
                    );
                }
            });

            res.status(201).json({ 
                msg: 'Order placed successfully!', 
                order_id: result.insertId,
                order_number: orderNumber 
            });
        });
    });
};

exports.getMyOrders = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const status = req.query.status || '';

    Order.findByUser(req.user.id, req.user.role, page, limit, status, (err, results) => {
        if (err) return res.status(500).json({ msg: 'Server error' });
        res.json(results);
    });
};

exports.getOrderDetails = (req, res) => {
    const orderId = req.params.id;
    Order.findById(orderId, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ msg: 'Order not found' });
        
        const order = results[0];
        // Authorization check
        if (req.user.role !== 'admin' && order.buyer_id !== req.user.id && order.farmer_id !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied' });
        }
        
        res.json(order);
    });
};

exports.updateOrderStatus = (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    Order.updateStatus(orderId, status, req.user.id, req.user.role, (err) => {
        if (err) return res.status(400).json({ msg: err.message || 'Update failed' });
        res.json({ msg: 'Status updated' });
    });
};

exports.getFarmerRevenue = (req, res) => {
    if (req.user.role !== 'farmer') return res.status(403).json({ msg: 'Access denied' });
    
    Order.getFarmerRevenue(req.user.id, (err, results) => {
        if (err) return res.status(500).json({ msg: 'Error' });
        res.json(results[0]);
    });
};