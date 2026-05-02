import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function WeatherWidget({ onWeatherData }) {
  const { t } = useTranslation();
  
  useEffect(() => {
    // Auto-load location from localStorage on mount
    const saved = localStorage.getItem('agritech_location');
    if (saved) {
      try {
        const { latitude, longitude, name } = JSON.parse(saved);
        setCityName(name || 'Current Location');
        fetchWeather(latitude, longitude, name || 'Current Location');
      } catch (e) {
        console.error("Error parsing saved location", e);
      }
    }
  }, []);
  const [locationError, setLocationError] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [cityName, setCityName] = useState('Current Location');

  const getWeatherIcon = (code) => {
    // WMO Weather interpretation codes (WW)
    const iconMap = {
      0: 'bi-sun-fill', 1: 'bi-sun-fill', 2: 'bi-cloud-sun-fill', 3: 'bi-clouds-fill',
      45: 'bi-cloud-haze-fill', 48: 'bi-cloud-haze-fill',
      51: 'bi-cloud-drizzle-fill', 53: 'bi-cloud-drizzle-fill', 55: 'bi-cloud-drizzle-fill',
      61: 'bi-cloud-rain-fill', 63: 'bi-cloud-rain-fill', 65: 'bi-cloud-rain-heavy-fill',
      71: 'bi-snow', 73: 'bi-snow', 75: 'bi-snow',
      80: 'bi-cloud-rain-fill', 81: 'bi-cloud-rain-fill', 82: 'bi-cloud-rain-heavy-fill',
      95: 'bi-cloud-lightning-rain-fill',
    };
    return iconMap[code] || 'bi-sun-fill';
  };

  const getWeatherDesc = (code) => {
    const descMap = {
      0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Depositing Rime Fog',
      51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
      61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
      80: 'Slight Rain Showers', 81: 'Moderate Rain Showers', 82: 'Violent Rain Showers',
      95: 'Thunderstorm',
    };
    return descMap[code] || 'Clear';
  };

  const fetchWeather = async (lat, lon, name = "Current Location") => {
    setLoading(true); setLocationError('');
    try {
      // Call our internal Gemini-powered weather synthesizer instead of Open-Meteo
      const response = await axios.get(`/api/weather?lat=${lat}&lon=${lon}&city=${encodeURIComponent(name)}`);
      
      const { current, forecast: days, resolved_city, lat: rLat, lon: rLon } = response.data;
      
      const weatherData = {
        temperature: current.temp,
        humidity: current.humidity,
        windspeed: current.wind,
        rain: current.rain,
        weathercode: current.weathercode,
        description: current.desc || getWeatherDesc(current.weathercode),
        latitude: rLat || lat,
        longitude: rLon || lon,
        city: resolved_city || name
      };
      
      setWeather(weatherData);
      setCityName(resolved_city || name);
      setForecast(days.map((day) => ({
        date: day.date,
        maxTemp: day.max,
        minTemp: day.min,
        icon: day.code
      })));
      
      localStorage.setItem('agritech_location', JSON.stringify({ latitude: rLat || lat, longitude: rLon || lon, name: resolved_city || name }));
      if (onWeatherData) onWeatherData(weatherData);
    } catch (err) {
      console.error(err);
      setLocationError("Failed to fetch weather data. The service might be temporarily unavailable.");
    } finally { setLoading(false); }
  };

  const fetchIpLocation = async () => {
    try {
      setLocationError("GPS blocked. Falling back to IP-based location...");
      const res = await axios.get('https://ipapi.co/json/');
      if (res.data && res.data.latitude) {
        fetchWeather(res.data.latitude, res.data.longitude, res.data.city || 'IP Location');
      } else {
        setLocationError("Could not determine location from IP either. Please enter your city manually.");
        setLoading(false);
      }
    } catch (err) {
      setLocationError("Automatic location completely failed. Please use manual entry.");
      setLoading(false);
    }
  };

  const requestLocation = () => {
    setLoading(true); setLocationError('');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeather(position.coords.latitude, position.coords.longitude, "Current GPS Location"),
        (err) => { 
          console.warn("GPS failed, trying IP...", err);
          fetchIpLocation(); 
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else { 
      fetchIpLocation(); 
    }
  };

  const handleManualCity = async () => {
    if (!manualCity.trim()) { setLocationError("Please enter a city or region."); return; }
    
    setLoading(true); setLocationError('');
    try {
      // Unified call: Let the backend handle both finding the city and fetching accurate weather
      const response = await axios.get(`/api/weather?city=${encodeURIComponent(manualCity)}`);
      
      const { current, forecast: days, resolved_city, lat, lon } = response.data;
      
      const weatherData = {
        temperature: current.temp,
        humidity: current.humidity,
        windspeed: current.wind,
        rain: current.rain,
        weathercode: current.weathercode,
        description: current.desc || getWeatherDesc(current.weathercode),
        latitude: lat,
        longitude: lon,
        city: resolved_city
      };
      
      setWeather(weatherData);
      setCityName(resolved_city);
      setForecast(days.map((day) => ({
        date: day.date,
        maxTemp: day.max,
        minTemp: day.min,
        icon: day.code
      })));
      
      setManualCity('');
      localStorage.setItem('agritech_location', JSON.stringify({ latitude: lat, longitude: lon, name: resolved_city }));
      if (onWeatherData) onWeatherData(weatherData);
    } catch (err) {
      console.error(err);
      setLocationError("Failed to find city or fetch weather. Please check spelling.");
    } finally {
      setLoading(false);
    }
  };

  const NC = '#39ff14'; // neon color shorthand
  const NCS = (opacity) => `rgba(57, 255, 20, ${opacity})`; // neon with opacity

  return (
    <div className="card border-0 text-white shadow-lg overflow-hidden position-relative mb-2 mt-2 mx-1"
         style={{ borderRadius: '1.5rem', background: `linear-gradient(135deg, #18181b 0%, #27272a 50%, ${NCS(0.06)} 100%)`, border: `1px solid ${NCS(0.12)}` }}>
      <i className="bi bi-cloud-sun position-absolute" style={{ fontSize: '10rem', top: '-30px', right: '-20px', opacity: '0.03', color: NC }}></i>

      <div className="card-body p-4 position-relative z-1 d-flex flex-column" style={{ minHeight: '300px' }}>
        {!weather && !loading && (
          <div className="d-flex flex-column justify-content-center h-100 flex-grow-1 z-2">
            <div className="d-flex justify-content-center mb-3 mt-2">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                   style={{ width: '100px', height: '100px', background: 'transparent', border: `1px solid ${NCS(0.25)}` }}>
                <div className="rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '70px', height: '70px', background: NCS(0.12) }}>
                  <i className="bi bi-geo-alt-fill" style={{ fontSize: '2.5rem', color: NC }}></i>
                </div>
              </div>
            </div>
            
            <h4 className="fw-bold text-center text-white mb-2" style={{letterSpacing: '-0.3px', fontSize: '1.4rem'}}>Location Required</h4>
            
            <p className="text-center mb-4 px-3" style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Allow GPS access for real-time weather & 7-day forecast.
            </p>
            
            {locationError && <p className="small fw-bold py-2 rounded-pill mx-3 shadow mb-3 text-center" style={{background: 'rgba(220, 38, 38, 0.15)', color: '#f87171'}}>{locationError}</p>}
            
            <div className="d-flex justify-content-start w-100 mb-4 px-2">
              <button className="btn px-4 py-2.5 fw-bold rounded-pill d-flex align-items-center shadow-lg" 
                      onClick={requestLocation}
                      style={{ background: NC, color: '#09090b', border: 'none', fontSize: '1.05rem', minWidth: '60%' }}>
                <i className="bi bi-crosshair me-2 fs-5"></i> Detect Location
              </button>
            </div>
            
            <p className="text-center mb-2" style={{ color: '#71717a', fontSize: '0.95rem' }}>Or enter city name:</p>
            
            <div className="px-2 pb-2">
              <div className="d-flex rounded-3 overflow-hidden" style={{ background: '#09090b', border: `1px solid ${NC}` }}>
                <input type="text" 
                       className="form-control border-0 bg-transparent text-white shadow-none" 
                       placeholder="e.g. Bangalore, Mumbai" 
                       value={manualCity} 
                       onChange={(e) => setManualCity(e.target.value)} 
                       onKeyDown={(e) => e.key === 'Enter' && handleManualCity()} 
                       style={{ padding: '0.8rem 1rem' }} />
                <button className="btn border-0 d-flex align-items-center justify-content-center" 
                        onClick={handleManualCity}
                        style={{ width: '50px', color: NC, background: 'transparent' }}>
                  <i className="bi bi-search fs-5"></i>
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center mt-auto mb-auto py-5">
            <div className="spinner-border mb-3" style={{width: '3rem', height: '3rem', color: NC}} role="status"></div>
            <p className="fw-bold" style={{color: '#a1a1aa'}}>Fetching weather data...</p>
          </div>
        )}

        {weather && !loading && (
          <div className="d-flex flex-column h-100 w-100 text-start">
            <div className="d-flex flex-column gap-2 mb-3 z-2 position-relative">
              <div className="d-flex justify-content-between align-items-center">
                <span className="badge px-3 py-2 rounded-pill fw-semibold d-flex align-items-center shadow-sm"
                      style={{background: NCS(0.08), border: `1px solid ${NCS(0.15)}`, color: NC}}>
                  <i className="bi bi-geo-fill me-2 fs-6"></i> {cityName}
                </span>
                <button className="btn btn-sm rounded-circle shadow-sm" onClick={requestLocation} title="Use My Location"
                        style={{background: NCS(0.08), color: NC, border: `1px solid ${NCS(0.15)}`, width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="bi bi-crosshair fs-6"></i>
                </button>
              </div>
              
              <div className="d-flex rounded-pill overflow-hidden mt-1 shadow-sm" style={{ background: '#09090b', border: `1px solid ${NCS(0.3)}` }}>
                <input type="text" 
                       className="form-control border-0 bg-transparent text-white shadow-none ps-3 py-1" 
                       placeholder="Search another city..." 
                       value={manualCity} 
                       onChange={(e) => setManualCity(e.target.value)} 
                       onKeyDown={(e) => e.key === 'Enter' && handleManualCity()} 
                       style={{ fontSize: '0.9rem' }} />
                <button className="btn border-0 d-flex align-items-center justify-content-center pe-3" 
                        onClick={handleManualCity}
                        style={{ color: NC, background: 'transparent' }}>
                  <i className="bi bi-search"></i>
                </button>
              </div>
              {locationError && <p className="small fw-bold py-1 px-3 rounded-pill shadow-sm mb-0 mt-1 text-center" style={{background: 'rgba(220, 38, 38, 0.15)', color: '#f87171'}}>{locationError}</p>}
            </div>

            <div className="d-flex align-items-center mb-4 pt-2">
              <i className={`bi ${getWeatherIcon(weather.weathercode)}`} style={{ fontSize: '4.5rem', color: NC, filter: `drop-shadow(0 4px 12px ${NCS(0.3)})` }}></i>
              <div className="ms-4">
                <h1 className="fw-bold mb-0" style={{ fontSize: '3.5rem', letterSpacing: '-2px', color: NC }}>{Math.round(weather.temperature)}°</h1>
                <p className="fw-semibold text-capitalize fs-5 mb-0" style={{color: '#a1a1aa'}}>{weather.description}</p>
              </div>
            </div>

            <div className="row g-2 mb-4 py-3 rounded-4 shadow-sm" style={{background: 'rgba(9, 9, 11, 0.5)', border: `1px solid ${NCS(0.06)}`}}>
              <div className="col-4 text-center">
                <i className="bi bi-droplet-half fs-4 d-block mb-1" style={{color: NC}}></i>
                <div className="fw-bold fs-5 mb-0">{weather.humidity}%</div>
                <div className="small" style={{color: '#71717a'}}>Humidity</div>
              </div>
              <div className="col-4 text-center" style={{borderLeft: `1px solid ${NCS(0.08)}`, borderRight: `1px solid ${NCS(0.08)}`}}>
                <i className="bi bi-cloud-rain-heavy fs-4 d-block mb-1" style={{color: NC}}></i>
                <div className="fw-bold fs-5 mb-0">{weather.rain} mm</div>
                <div className="small" style={{color: '#71717a'}}>Rainfall</div>
              </div>
              <div className="col-4 text-center">
                <i className="bi bi-wind fs-4 d-block mb-1" style={{color: NC}}></i>
                <div className="fw-bold fs-5 mb-0">{Math.round(weather.windspeed)}</div>
                <div className="small" style={{color: '#71717a'}}>km/h</div>
              </div>
            </div>

            <h6 className="fw-bold mb-3 text-uppercase small" style={{color: NC, letterSpacing: '0.05em'}}><i className="bi bi-calendar-week me-2"></i>7-Day Forecast</h6>
            <div className="d-flex gap-2 overflow-auto pb-2" style={{scrollbarWidth: 'none'}}>
              {forecast.map((day, idx) => (
                <div key={idx} className="rounded-4 p-3 text-center d-flex flex-column align-items-center shadow-sm"
                     style={{minWidth: '80px', background: 'rgba(9, 9, 11, 0.6)', border: `1px solid ${NCS(0.06)}`}}>
                  <div className="small fw-bold mb-2" style={{color: idx === 0 ? NC : '#71717a'}}>{idx === 0 ? 'Today' : getDayName(day.date)}</div>
                  <i className={`bi ${getWeatherIcon(day.icon)} fs-3 mb-2 d-block`} style={{color: NC}}></i>
                  <div className="fw-bold text-white fs-5">{Math.round(day.maxTemp)}°</div>
                  <div className="small fw-semibold" style={{color: '#71717a'}}>{Math.round(day.minTemp)}°</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getDayName(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export default WeatherWidget;
