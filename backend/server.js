const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello from Farm Connect Backend! Day 1 Setup Complete 🎉');
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});