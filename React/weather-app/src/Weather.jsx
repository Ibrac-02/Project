import React, { useState } from 'react';
import axios from 'axios';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = 'a6cee3a975365b3f2d6cd8e7d43cb054'; 

  const fetchWeatherData = async () => {
    if (!city) return;
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      setWeatherData(response.data);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeatherData();
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      width: '300px',
      marginTop: '20px'
    }}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        marginBottom: '20px'
      }}>
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            flexGrow: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px 0 0 4px',
            outline: 'none'
          }}
        />
        <button type="submit" style={{
          padding: '10px 15px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '0 4px 4px 0',
          cursor: 'pointer'
        }}>
          Get Weather
        </button>
      </form>

      {loading && <p style={{ color: '#555' }}>Loading...</p>}
      {error && <p style={{ color: '#dc3545' }}>{error}</p>}
      {weatherData && !error && (
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ color: '#333', marginBottom: '10px' }}>{weatherData.name}</h2>
          <p style={{ color: '#555', margin: '5px 0' }}>Temperature: {weatherData.main.temp}°C</p>
          <p style={{ color: '#555', margin: '5px 0' }}>Weather: {weatherData.weather[0].description}</p>
        </div>
      )}
    </div>
  );
};

export default Weather;
