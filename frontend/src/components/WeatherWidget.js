import React, { useState, useEffect } from 'react';
import api from '../services/api';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('Delhi');
  const [input, setInput] = useState('Delhi');
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (location) => {
    setLoading(true);
    try {
      const res = await api.get(`/weather?city=${encodeURIComponent(location)}`);
      setWeather(res.data);
      setCity(location);
    } catch (err) {
      alert('Weather not available for this city');
      console.error(err);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) fetchWeather(input.trim());
  };

  useEffect(() => {
    fetchWeather('Delhi');
  }, []);

  if (loading) return <div className="text-center py-8 text-white text-2xl">Loading weather... ☁️</div>;

  if (!weather) return null;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl shadow-2xl p-10 text-white max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-8 flex gap-4 justify-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter city (e.g., Mumbai)"
          className="px-6 py-4 rounded-xl text-black text-lg w-64 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition"
        >
          Search
        </button>
      </form>

      <div className="text-center">
        <h3 className="text-4xl font-bold mb-4">{weather.city}</h3>
        <img
          src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
          alt="weather"
          className="mx-auto w-40 h-40"
        />
        <p className="text-7xl font-bold mb-4">{weather.temp}°C</p>
        <p className="text-3xl capitalize mb-6">{weather.description}</p>
        <p className="text-2xl mb-2">Feels like {weather.feels_like}°C</p>

        <div className="grid grid-cols-3 gap-6 mt-10 text-xl">
          <div className="bg-white/20 rounded-2xl p-4">
            <p className="font-semibold">Humidity</p>
            <p className="text-3xl">{weather.humidity}%</p>
          </div>
          <div className="bg-white/20 rounded-2xl p-4">
            <p className="font-semibold">Wind</p>
            <p className="text-3xl">{weather.wind_speed} m/s</p>
          </div>
          <div className="bg-white/20 rounded-2xl p-4">
            <p className="font-semibold">Pressure</p>
            <p className="text-3xl">{weather.pressure} hPa</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;