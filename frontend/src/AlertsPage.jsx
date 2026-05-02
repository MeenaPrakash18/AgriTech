import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './NotificationContext';

function AlertsPage() {
  const navigate = useNavigate();
  const { notifications, preferences, togglePreference, clearHistory, triggerAlert, sendManualAlert } = useNotification();
  
  const [farmerPhone, setFarmerPhone] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneLinked, setPhoneLinked] = useState(false);
  const [smsMode, setSmsMode] = useState('sms'); // 'sms' or 'whatsapp'
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // 'success', 'error'
  const NC = '#39ff14';
  const NCS = (o) => `rgba(57, 255, 20, ${o})`;

  useEffect(() => {
    // Sync Phone Data
    const init = async () => {
      const token = localStorage.getItem('agritech_token');
      if (token) {
        try {
          const res = await axios.get('/api/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
            const user = res.data.user;
          if (user.phone) {
            setFarmerPhone(user.phone);
            setPhoneInput(user.phone);
            setPhoneLinked(true);
            localStorage.setItem('agritech_farmer_phone', user.phone);
          }
        } catch (err) { console.error("Profile fetch failed", err); }
      } else {
        const savedPhone = localStorage.getItem('agritech_farmer_phone');
        if (savedPhone) { 
          setFarmerPhone(savedPhone); 
          setPhoneLinked(true); 
          setPhoneInput(savedPhone); 
        }
      }
      
    };
    init();
  }, []);

  const handleLinkPhone = async () => {
    const cleaned = phoneInput.replace(/[^0-9+]/g, '');
    if (cleaned.length >= 10) {
      setFarmerPhone(cleaned);
      setPhoneLinked(true);
      localStorage.setItem('agritech_farmer_phone', cleaned);
      
      const token = localStorage.getItem('agritech_token');
      if (token && token !== 'demo-token') {
        try {
          await axios.post('/api/user/update-phone', 
            { phone: cleaned },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {}
      }
    }
  };

  const handleUnlinkPhone = async () => {
    setFarmerPhone('');
    setPhoneLinked(false);
    setPhoneInput('');
    localStorage.removeItem('agritech_farmer_phone');
    if (preferences.smsEnabled) togglePreference('smsEnabled'); // Turn off SMS if unlinked
    
    const token = localStorage.getItem('agritech_token');
    if (token && token !== 'demo-token') {
      try {
        await axios.post('/api/user/update-phone', 
          { phone: '' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {}
    }
  };

  const colors = { 
    danger: { bg: 'rgba(220,38,38,0.08)', accent: '#f87171', bar: '#dc2626' }, 
    warning: { bg: 'rgba(245,158,11,0.08)', accent: '#fbbf24', bar: '#f59e0b' },
    success: { bg: NCS(0.06), accent: NC, bar: '#22c55e' }, 
    info: { bg: 'rgba(56,189,248,0.08)', accent: '#38bdf8', bar: '#0284c7' } 
  };

  return (
    <div className="d-flex flex-column h-100 px-4 py-4 mb-5 pb-5 animation-fade-in page-enter text-white">
      
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-sm rounded-circle me-3 border-0" onClick={() => navigate(-1)} style={{background: NCS(0.06), color: NC, width: '40px', height: '40px'}}><i className="bi bi-arrow-left fs-4"></i></button>
        <h2 className="fw-bold mb-0"><i className="bi bi-bell-fill me-2" style={{color: NC}}></i> Alerts & Notifications</h2>
      </div>

      <div className="flex-grow-1 overflow-auto pe-2" style={{scrollbarWidth: 'none'}}>
        
        {/* === PREFERENCES PANEL === */}
        <div className="glass-panel rounded-4 mb-4 shadow-sm overflow-hidden" style={{border: `1px solid ${NCS(0.1)}`}}>
          <div className="p-3 mb-0 d-flex align-items-center justify-content-between" style={{background: 'rgba(9, 9, 11, 0.4)', borderBottom: `1px solid ${NCS(0.06)}`}}>
             <div className="d-flex align-items-center">
               <i className="bi bi-sliders me-2" style={{color: NC}}></i>
               <h6 className="fw-bold mb-0">Notification Settings</h6>
             </div>
              <button 
                className={`btn btn-sm fw-bold px-3 transition-all ${testStatus === 'success' ? 'btn-success' : testStatus === 'error' ? 'btn-danger' : 'btn-light'}`} 
                style={{ background: testStatus === 'success' ? '#22c55e' : testStatus === 'error' ? '#dc2626' : NC, color: testStatus ? '#fff' : '#09090b', border: 'none' }}
                disabled={isSendingTest || !phoneLinked}
                onClick={async () => {
                  setIsSendingTest(true);
                  const res = await sendManualAlert("Test Alert", "This is a verification message from your AgriTech Assistant. Your phone is successfully linked!");
                  setIsSendingTest(false);
                  setTestStatus(res.success ? 'success' : 'error');
                  setTimeout(() => setTestStatus(null), 3000);
                  
                  // Also trigger a local UI notification for history
                  triggerAlert("Test Alert Sent", "A verification message was dispatched to your linked number.", "weather", "MEDIUM", "bi-phone-vibrate", "success");
                }} 
              >
                {isSendingTest ? (
                  <><span className="spinner-border spinner-border-sm me-1"></span> Sending...</>
                ) : testStatus === 'success' ? (
                  <><i className="bi bi-check-lg me-1"></i> Sent!</>
                ) : testStatus === 'error' ? (
                  <><i className="bi bi-exclamation-circle me-1"></i> Failed</>
                ) : (
                  <><i className="bi bi-send-fill me-1"></i> Send Test Alert</>
                )}
              </button>
          </div>
          
          <div className="p-3">
            {/* Global Switches */}
            <div className="d-flex align-items-center justify-content-between mb-3 pb-3" style={{borderBottom: '1px dashed rgba(255,255,255,0.1)'}}>
              <div>
                <h6 className="mb-1 text-white fw-bold"><i className="bi bi-app-indicator me-2" style={{color: '#38bdf8'}}></i>Web Push Alerts</h6>
                <p className="small mb-0" style={{color: '#a1a1aa'}}>Receive instant desktop/mobile popups.</p>
              </div>
              <div className="form-check form-switch fs-4">
                <input className="form-check-input" type="checkbox" checked={preferences.pushEnabled} onChange={() => togglePreference('pushEnabled')} />
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3 pb-3" style={{borderBottom: '1px dashed rgba(255,255,255,0.1)'}}>
              <div>
                <h6 className="mb-1 text-white fw-bold"><i className="bi bi-chat-left-dots-fill me-2" style={{color: '#38bdf8'}}></i>Normal SMS (Twilio)</h6>
                <p className="small mb-0" style={{color: '#a1a1aa'}}>{phoneLinked ? `Routing alerts to ${farmerPhone}` : 'Link phone below to enable.'}</p>
              </div>
              <div className="form-check form-switch fs-4">
                <input className="form-check-input" type="checkbox" checked={preferences.smsEnabled} onChange={() => togglePreference('smsEnabled')} disabled={!phoneLinked} style={{opacity: phoneLinked ? 1 : 0.4}}/>
              </div>
            </div>

            {/* Smart Categories */}
            <h6 className="small fw-bold mb-3 mt-4" style={{color: '#71717a'}}>SMART FILTERS</h6>
            <div className="d-flex flex-wrap gap-2">
              <button className={`btn btn-sm rounded-pill fw-bold ${preferences.weather ? 'btn-light text-dark' : 'btn-outline-secondary'}`} onClick={() => togglePreference('weather')}>
                <i className="bi bi-cloud-sun-fill me-1"></i> Weather
              </button>
              <button className={`btn btn-sm rounded-pill fw-bold ${preferences.market ? 'btn-light text-dark' : 'btn-outline-secondary'}`} onClick={() => togglePreference('market')}>
                <i className="bi bi-graph-up-arrow me-1"></i> Markets
              </button>
              <button className={`btn btn-sm rounded-pill fw-bold ${preferences.schemes ? 'btn-light text-dark' : 'btn-outline-secondary'}`} onClick={() => togglePreference('schemes')}>
                <i className="bi bi-bank2 me-1"></i> Schemes
              </button>
              <button className={`btn btn-sm rounded-pill fw-bold ${preferences.diseases ? 'btn-light text-dark' : 'btn-outline-secondary'}`} onClick={() => togglePreference('diseases')}>
                <i className="bi bi-bug-fill me-1"></i> Disease
              </button>
            </div>
          </div>
        </div>

        {/* === PHONE LINKING === */}
        <div className="glass-panel rounded-4 mb-4 p-4 shadow-sm" style={{border: `1px solid ${NCS(0.1)}`}}>
          <h6 className="fw-bold mb-3 text-white"><i className="bi bi-telephone-fill me-2" style={{color: NC}}></i>Verified Number</h6>
          {!phoneLinked ? (
            <div className="input-group mb-2">
              <span className="input-group-text"><i className="bi bi-hash"></i></span>
              <input type="tel" className="form-control" placeholder="+91 98765 43210" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
              <button className="btn px-3 fw-bold" onClick={handleLinkPhone} style={{background: `linear-gradient(135deg, #22c55e, ${NC})`, color: '#09090b'}}>Link</button>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{background: 'rgba(9, 9, 11, 0.5)', border: `1px solid ${NCS(0.06)}`}}>
              <div>
                <a href={`tel:${farmerPhone}`} className="text-decoration-none fw-bold fs-5 d-block" style={{color: NC}}>
                  <i className="bi bi-telephone-plus me-2"></i>{farmerPhone}
                </a>
              </div>
              <button className="btn btn-sm rounded-pill px-3" onClick={handleUnlinkPhone} style={{background: 'rgba(220, 38, 38, 0.1)', color: '#f87171', border: '1px solid rgba(220, 38, 38, 0.2)'}}>
                <i className="bi bi-x-circle me-1"></i>Unlink
              </button>
            </div>
          )}
        </div>


        {/* === NOTIFICATION HISTORY === */}
        <div className="d-flex align-items-center justify-content-between mb-3 mt-4">
          <h5 className="fw-bold mb-0 text-white"><i className="bi bi-clock-history me-2" style={{color: NC}}></i>Recent Alerts</h5>
          {notifications.length > 0 && (
            <button className="btn btn-sm btn-link text-secondary text-decoration-none p-0" onClick={clearHistory}>Clear All</button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center p-5 rounded-4" style={{background: 'rgba(24, 24, 27, 0.5)', border: '1px dashed rgba(255,255,255,0.1)'}}>
            <i className="bi bi-check2-circle display-4 text-secondary mb-3"></i>
            <p className="text-secondary fw-bold mb-0">No recent alerts</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {notifications.map((alert) => {
              const c = colors[alert.cardColor] || colors.info;
              const time = new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
              
              return (
                <div key={alert.id} className="rounded-4 p-4 shadow-sm position-relative overflow-hidden" style={{background: c.bg, border: `1px solid ${c.accent}22`, animation: 'slideInRight 0.3s ease both'}}>
                  <div className="position-absolute top-0 start-0 bottom-0" style={{width: '4px', background: c.bar}}></div>
                  
                  <div className="position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2">
                    {alert.priority === 'HIGH' && <span className="badge rounded-pill bg-danger"><i className="bi bi-exclamation-triangle-fill"></i></span>}
                    <span className="small text-secondary fw-bold">{time}</span>
                  </div>

                  <div className="d-flex align-items-center mb-2 ps-2">
                    <i className={`bi ${alert.iconClass} fs-3 me-3`} style={{color: c.accent}}></i>
                    <h6 className="fw-bold mb-0 text-white">{alert.title}</h6>
                  </div>
                  <p className="small mb-0 ps-2" style={{color: '#d4d4d8', lineHeight: '1.5'}}>{alert.msg}</p>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default AlertsPage;
