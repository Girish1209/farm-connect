const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    req.io = io;
    next();
});
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/crops', require('./routes/crop'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/alerts', require('./routes/alert'));

app.get('/', (req, res) => {
    res.send('Farm Connect Backend with Real-Time Socket.io Running! ⚡ Day 5 Complete');
});

// Socket.io Events
io.on('connection', (socket) => {
    console.log('A user connected! 🟢');

    socket.on('newComment', (comment) => {
        io.emit('newComment', comment); // Broadcast to all
    });

    socket.on('newAlert', (alert) => {
        io.emit('newAlert', alert);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected 🔴');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} with Socket.io ready! ⚡`);
});