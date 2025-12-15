const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const path = require('path');
const weatherRouter = require('./routes/weather');

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
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/user'));
app.use('/api/weather', require('./routes/weather'));

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

cron.schedule('0 */6 * * *', async () => {
  try {
    const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
    if (res.data.weather[0].main.toLowerCase().includes('rain')) {
      // Create alert (call your alert controller)
      console.log('Rain detected – create alert!');
    }
  } catch (err) {}
});


io.on('connection', (socket) => {
  socket.on('sendMessage', ({ sender_id, receiver_id, message }) => {
    // Save to DB + emit
    io.to(`user_${receiver_id}`).emit('newMessage', { sender_id, message });
  });

  socket.on('joinRoom', (user_id) => {
    socket.join(`user_${user_id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} with Socket.io ready! ⚡`);
});