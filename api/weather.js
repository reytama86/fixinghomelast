// src/services/weather.js

import axios from 'axios';
import { apiKey } from '../constants';

const DEFAULT_LAT = -8.128262;
const DEFAULT_LON = 113.722259;

/** Bangun endpoint OpenWeatherMap Current Weather */
function buildCurrentEndpoint(lat = DEFAULT_LAT, lon = DEFAULT_LON) {
  return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
}

async function apiCall(endpoint) {
  try {
    const { data } = await axios.get(endpoint);
    return data;
  } catch (err) {
    console.error('[weather.js] API call failed:', err.message);
    return null;
  }
}

export async function fetchCurrentWeather(opts = {}) {
  const { lat, lon } = opts;
  const endpoint = buildCurrentEndpoint(lat, lon);
  const data = await apiCall(endpoint);
  if (!data) return null;

  // Tentukan day/night dari suffix icon
  const iconCode = data.weather[0]?.icon || '';
  const isDay = iconCode.endsWith('d') ? 1 : 0;

  return {
    is_day: isDay,
    description: data.weather[0]?.description || '',
    temp: Math.round(data.main.temp),
    humidity: data.main.humidity,
    wind_speed: data.wind.speed,
  };
}
