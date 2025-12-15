const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.OPENWEATHER_API_KEY;

exports.getWeather = async (req, res) => {
    const { city = 'Delhi', lat, lon } = req.query;

    let url;
    if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    } else {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    }

    try {
        const response = await axios.get(url);
        const data = response.data;

        const weatherInfo = {
            city: data.name,
            temp: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            wind_speed: data.wind.speed,
            pressure: data.main.pressure
        };

        res.json(weatherInfo);
    } catch (err) {
        console.error('Weather API error:', err.response?.data || err.message);
        res.status(500).json({ msg: 'Weather data unavailable' });
    }
};