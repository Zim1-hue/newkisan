import { useState } from 'react';
import { useApp } from '../context/StateCentral';

// Open-Meteo free API (no key required) + geocoding
async function geocode(city) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );
  const data = await res.json();
  if (!data.results?.length) throw new Error('City not found');
  return { lat: data.results[0].latitude, lon: data.results[0].longitude, name: data.results[0].name };
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max` +
    `&timezone=Asia%2FKolkata&forecast_days=4`;
  const res = await fetch(url);
  return res.json();
}

function weatherCodeDesc(code) {
  if (code === 0) return { desc: 'Clear Sky', icon: '☀️' };
  if (code <= 3) return { desc: 'Partly Cloudy', icon: '⛅' };
  if (code <= 49) return { desc: 'Foggy', icon: '🌫️' };
  if (code <= 67) return { desc: 'Rainy', icon: '🌧️' };
  if (code <= 77) return { desc: 'Snowy', icon: '❄️' };
  if (code <= 82) return { desc: 'Rain Showers', icon: '🌦️' };
  if (code <= 99) return { desc: 'Thunderstorm', icon: '⛈️' };
  return { desc: 'Unknown', icon: '🌡️' };
}

function generateAdvisories(weather, t) {
  const advisories = [];
  const temp = weather.current.temperature_2m;
  const humidity = weather.current.relative_humidity_2m;
  const rain = weather.current.precipitation;
  const code = weather.current.weather_code;

  if (rain > 5 || (code >= 51 && code <= 82)) {
    advisories.push({ icon: '⚠️', text: t.weather.avoid_spray, color: 'bg-red-50 border-red-300 text-red-800' });
  } else if (humidity < 70 && temp >= 20 && temp <= 32) {
    advisories.push({ icon: '💧', text: t.weather.good_irrigation, color: 'bg-blue-50 border-blue-300 text-blue-800' });
  }

  if (humidity > 80) {
    advisories.push({ icon: '🍄', text: t.weather.high_humidity_warn, color: 'bg-orange-50 border-orange-300 text-orange-800' });
  }

  if (temp > 36) {
    advisories.push({ icon: '🌡️', text: t.weather.hot_day, color: 'bg-yellow-50 border-yellow-300 text-yellow-800' });
  } else if (temp < 20 && temp > 10) {
    advisories.push({ icon: '🌾', text: t.weather.cool_weather, color: 'bg-green-50 border-green-300 text-green-800' });
  }

  if (rain === 0 && humidity < 60 && temp >= 18 && temp <= 30) {
    advisories.push({ icon: '🌱', text: t.weather.good_sowing, color: 'bg-green-50 border-green-300 text-green-800' });
  }

  return advisories;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeatherTab() {
  const { t } = useApp();
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState('');

  async function handleFetch(e) {
    e.preventDefault();
    if (!location.trim()) return;
    setLoading(true);
    setError('');
    setWeather(null);
    try {
      const geo = await geocode(location);
      const data = await fetchWeather(geo.lat, geo.lon);
      setWeather(data);
      setLocationName(geo.name);
    } catch (err) {
      setError('Location not found. Try a different city name.');
    }
    setLoading(false);
  }

  async function useMyLocation() {
    setLoading(true);
    setError('');
    setWeather(null);
    if (!navigator.geolocation) {
      setError(t.weather.locationError);
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords;
          // Reverse geocode
          const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=&count=1&language=en&format=json`);
          const data = await fetchWeather(lat, lon);
          setWeather(data);
          setLocationName('Your Location');
        } catch {
          setError(t.weather.locationError);
        }
        setLoading(false);
      },
      () => {
        setError(t.weather.locationError);
        setLoading(false);
      }
    );
  }

  const advisories = weather ? generateAdvisories(weather, t) : [];
  const current = weather?.current;
  const daily = weather?.daily;

  const inputClass = "flex-1 border-2 border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:border-green-600";

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
          🌤️ {t.weather.title}
        </h2>

        <form onSubmit={handleFetch} className="flex gap-2 mb-3">
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder={t.weather.enterLocation}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-5 rounded-lg"
          >
            {loading ? '⏳' : '🔍'}
          </button>
        </form>

        <button
          onClick={useMyLocation}
          disabled={loading}
          className="w-full border-2 border-green-600 text-green-700 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-green-50"
        >
          📍 {t.weather.useMyLocation}
        </button>

        {error && (
          <div className="mt-3 bg-red-50 border border-red-300 rounded-lg p-3 text-red-700 text-sm">⚠️ {error}</div>
        )}

        {loading && (
          <div className="mt-4 text-center text-gray-500 py-6">
            <div className="text-4xl mb-2 animate-pulse">🌍</div>
            <p>{t.weather.loading}</p>
          </div>
        )}
      </div>

      {weather && current && (
        <>
          {/* Current Weather */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-blue-200 text-sm font-semibold">{t.weather.current}</p>
                <p className="text-xl font-bold">📍 {locationName}</p>
              </div>
              <div className="text-right">
                <div className="text-5xl">{weatherCodeDesc(current.weather_code).icon}</div>
                <p className="text-blue-200 text-sm">{weatherCodeDesc(current.weather_code).desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: t.weather.temperature, value: `${Math.round(current.temperature_2m)}°C`, icon: '🌡️' },
                { label: t.weather.humidity, value: `${current.relative_humidity_2m}%`, icon: '💧' },
                { label: t.weather.rainfall, value: `${current.precipitation} mm`, icon: '🌧️' },
                { label: t.weather.wind, value: `${Math.round(current.wind_speed_10m)} km/h`, icon: '💨' },
              ].map((item, i) => (
                <div key={i} className="bg-blue-700 bg-opacity-50 rounded-xl p-3 text-center">
                  <div className="text-xl">{item.icon}</div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-blue-300 text-xs">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Day Forecast */}
          {daily && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-3">📅 {t.weather.forecast}</h3>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(i => {
                  const date = new Date(daily.time[i]);
                  const { icon } = weatherCodeDesc(daily.weather_code[i]);
                  return (
                    <div key={i} className="bg-blue-50 rounded-xl p-3 text-center">
                      <p className="text-xs font-bold text-gray-600">{DAYS[date.getDay()]}</p>
                      <div className="text-3xl my-1">{icon}</div>
                      <p className="text-sm font-bold text-gray-800">
                        {Math.round(daily.temperature_2m_max[i])}° / {Math.round(daily.temperature_2m_min[i])}°
                      </p>
                      <p className="text-xs text-blue-600">🌧️ {daily.precipitation_sum[i].toFixed(1)} mm</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Smart Advisory */}
          {advisories.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 mb-3">💡 {t.weather.advisory}</h3>
              <div className="space-y-2">
                {advisories.map((adv, i) => (
                  <div key={i} className={`border rounded-xl p-3 flex items-center gap-3 ${adv.color}`}>
                    <span className="text-2xl">{adv.icon}</span>
                    <p className="font-semibold text-sm">{adv.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
