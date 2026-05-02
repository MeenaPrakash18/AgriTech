import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WeatherWidget from './WeatherWidget';
import { API_ENDPOINTS } from './apiConfig';

function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  useEffect(() => {
    if (weatherData) {
      fetch(API_ENDPOINTS.SEND_SMS, { // Using SEND_SMS as a proxy for alerts if needed, or specific alerts endpoint
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather: weatherData })
      }).then(r => r.json()).then(alerts => setAlertCount(alerts.filter(a => a.type !== 'success').length))
        .catch(() => setAlertCount(2));
    }
  }, [weatherData]);

  const handleLogout = () => { localStorage.removeItem('agritech_token'); navigate('/login'); };

  const gridItems = [
    { label: 'Alerts', icon: 'bi-bell-fill', route: '/alerts',
      badge: alertCount > 0 ? `${alertCount} ACTIVE` : null, badgeColor: alertCount > 0 ? '#dc2626' : null,
      iconBg: alertCount > 0 ? 'rgba(220, 38, 38, 0.15)' : 'rgba(57, 255, 20, 0.08)',
      iconColor: alertCount > 0 ? '#f87171' : '#39ff14' },
    { label: 'Market', icon: 'bi-graph-up-arrow', route: '/market', iconBg: 'rgba(57, 255, 20, 0.08)', iconColor: '#39ff14' },
    { label: 'Profits', icon: 'bi-currency-rupee', route: '/profit', iconBg: 'rgba(57, 255, 20, 0.08)', iconColor: '#39ff14' },
    { label: 'Schemes', icon: 'bi-bank2', route: '/schemes', iconBg: 'rgba(57, 255, 20, 0.08)', iconColor: '#39ff14' },
  ];

  return (
    <div className="d-flex flex-column min-vh-100 text-light pb-5 mb-4 page-enter" style={{background: '#09090b'}}>
      <header className="px-3 py-3 d-flex justify-content-between align-items-center sticky-top shadow-sm"
              style={{backgroundColor: 'rgba(9, 9, 11, 0.95)', backdropFilter: 'blur(20px)', zIndex: 1020, borderBottom: '1px solid rgba(57, 255, 20, 0.06)'}}>
        <div className="d-flex align-items-center fw-bold fs-4 gap-2">
          <img src="/logo.png" alt="" style={{width: '32px', height: '32px', borderRadius: '8px'}} />
          <span className="text-neon-gradient">AgriTech</span>
        </div>
        <div className="d-flex gap-3 align-items-center">
          {isOffline && <span className="badge bg-danger rounded-pill px-2 py-1 small animation-pulse"><i className="bi bi-wifi-off me-1"></i> Offline</span>}
          <div onClick={handleLogout} style={{cursor: 'pointer', width: '40px', height: '40px', background: 'rgba(57, 255, 20, 0.06)', border: '1px solid rgba(57, 255, 20, 0.12)'}}
               className="rounded-circle d-flex align-items-center justify-content-center shadow-sm">
            <i className="bi bi-person-fill fs-5" style={{color: '#39ff14'}}></i>
          </div>
        </div>
      </header>

      <main className="p-3 d-flex flex-column gap-3 w-100 mx-auto" style={{maxWidth: '600px'}}>
        <section className="mt-1"><WeatherWidget onWeatherData={setWeatherData} /></section>

        <div className="d-flex flex-column gap-3">
          <div className="card border-0 shadow-lg overflow-hidden position-relative"
               onClick={() => navigate('/soil', { state: { weatherData } })}
               style={{borderRadius: '1.25rem', background: 'linear-gradient(135deg, #14532d 0%, #22c55e 100%)', cursor: 'pointer', border: '1px solid rgba(57, 255, 20, 0.2)'}}>
            <i className="bi bi-stars position-absolute" style={{fontSize: '6rem', right: '-10px', bottom: '-10px', opacity: 0.1, color: '#39ff14'}}></i>
            <div className="card-body p-4 position-relative z-1 d-flex align-items-center justify-content-between">
              <div>
                <h3 className="fw-bold mb-1 text-white"><i className="bi bi-magic me-2" style={{color: '#d1fae5'}}></i> Crop Planner</h3>
                <p className="mb-0 small" style={{color: 'rgba(255,255,255,0.6)'}}>AI-powered soil & profit analysis</p>
              </div>
              <div className="rounded-circle p-2" style={{background: 'rgba(255,255,255,0.15)'}}><i className="bi bi-arrow-right-short fs-2 text-white"></i></div>
            </div>
          </div>

          <div className="card border-0 shadow-lg overflow-hidden position-relative"
               style={{borderRadius: '1.25rem', background: 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)', cursor: 'pointer', border: '1px solid rgba(57, 255, 20, 0.1)'}}
               onClick={() => navigate('/scan')}>
            <i className="bi bi-camera position-absolute" style={{fontSize: '6rem', right: '-10px', bottom: '-10px', opacity: 0.06, color: '#39ff14'}}></i>
            <div className="card-body p-4 position-relative z-1 d-flex align-items-center justify-content-between">
              <div>
                <h3 className="fw-bold mb-1 text-white"><i className="bi bi-camera-fill me-2" style={{color: '#39ff14'}}></i> Leaf Scan</h3>
                <p className="mb-0 small" style={{color: 'rgba(255,255,255,0.5)'}}>Identify & treat crop diseases</p>
              </div>
              <div className="rounded-circle p-2" style={{background: 'rgba(57, 255, 20, 0.08)'}}><i className="bi bi-arrow-right-short fs-2" style={{color: '#39ff14'}}></i></div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          {gridItems.map((item, idx) => (
            <div className="col-6" key={idx}>
              <div className="card border-0 shadow h-100 glass-panel overflow-hidden position-relative"
                   style={{borderRadius: '1.25rem', background: item.badge ? 'rgba(220, 38, 38, 0.06)' : 'rgba(24, 24, 27, 0.6)', cursor: 'pointer', border: '1px solid rgba(57, 255, 20, 0.06)'}}
                   onClick={() => navigate(item.route)}>
                <div className="card-body p-3 text-center">
                  <div className="rounded-4 p-3 mb-2 d-inline-block" style={{background: item.iconBg}}><i className={`bi ${item.icon} fs-2`} style={{color: item.iconColor}}></i></div>
                  <h6 className="fw-bold mb-1 text-white">{item.label}</h6>
                  {item.badge && <span className="badge rounded-pill px-2 py-1" style={{background: item.badgeColor, color: '#fff', fontSize: '0.7rem'}}>{item.badge}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card border-0 shadow glass-panel mt-2"
             style={{borderRadius: '1.25rem', background: 'rgba(24, 24, 27, 0.4)', cursor: 'pointer', border: '1px solid rgba(57, 255, 20, 0.04)'}}
             onClick={() => navigate('/resources')}>
          <div className="card-body p-3 d-flex align-items-center">
            <div className="rounded-3 p-2 me-3" style={{background: 'rgba(57, 255, 20, 0.06)'}}><i className="bi bi-geo-alt-fill" style={{color: '#39ff14'}}></i></div>
            <div className="flex-grow-1">
              <h6 className="mb-0 fw-bold" style={{color: '#a1a1aa'}}>Nearby Resources</h6>
              <p className="small mb-0" style={{color: '#52525b'}}>Tools, Seeds & Repair shops</p>
            </div>
            <i className="bi bi-chevron-right" style={{color: '#39ff14'}}></i>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
