import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function AlertsWidget({ weather }) {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!weather) return;

    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weather, crop: 'Rice' }) // Default crop for now
        });
        const data = await response.json();
        setAlerts(data);
      } catch (err) {
        console.error("Alerts fetch failed", err);
      }
    };

    fetchAlerts();
  }, [weather]);

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="card shadow-sm border-top border-warning border-4 h-100 pb-2">
      <div className="card-body p-4 d-flex flex-column">
        <h5 className="card-title text-warning mb-4">
          <i className="bi bi-bell-fill me-2"></i>{t('AlertsTitle', 'Smart Alerts')}
        </h5>
        
        {!weather ? (
          <div className="text-center mt-auto mb-auto py-3">
             <i className="bi bi-shield-lock text-muted display-4 mb-3 d-block"></i>
             <p className="text-muted small mb-0">Waiting for location access to generate real-time alerts.</p>
          </div>
        ) : (
          <div className="mt-1 d-flex flex-column gap-3 overflow-auto pe-2" style={{maxHeight: '300px'}}>
            {alerts.length === 0 && (
              <div className="text-center py-4 text-muted small">No active alerts.</div>
            )}
            {alerts.map((alert) => (
              <div key={alert.id} className={`alert alert-${alert.type} d-flex align-items-start mb-0 shadow-sm position-relative overflow-hidden`}>
                <div className={`position-absolute top-0 start-0 bottom-0 bg-${alert.type}`} style={{width: '4px'}}></div>
                <i className={`bi ${alert.icon} fs-4 me-3 mt-1`}></i>
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-1">{alert.title}</h6>
                  <p className="small mb-0 opacity-75">{alert.msg}</p>
                </div>
                {alert.id !== 0 && (
                  <button type="button" className="btn-close btn-close-white ms-2 opacity-50 small" style={{fontSize: '0.7rem'}} onClick={() => dismissAlert(alert.id)}></button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AlertsWidget;
