import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function SoilInputPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const weatherData = location.state?.weatherData;

  const [soilType, setSoilType] = useState('Red');
  const [waterStatus, setWaterStatus] = useState('Medium');
  const [sunlight, setSunlight] = useState('Partial');
  const [landSize, setLandSize] = useState('');

  const soilOptions = [
    { name: 'Red', icon: '🔴' }, { name: 'Black', icon: '⚫' }, { name: 'Sandy', icon: '🟡' }, { name: 'Clay', icon: '🟤' }, { name: 'Loamy', icon: '🟠' },
  ];

  const resetForm = () => {
    setSoilType('Red');
    setWaterStatus('Medium');
    setSunlight('Partial');
    setLandSize('');
  };

  const PillButton = ({ active, onClick, children }) => (
    <button onClick={onClick} className="btn btn-sm px-3 py-2 rounded-pill fw-semibold"
      style={{ background: active ? 'linear-gradient(135deg, #22c55e, #39ff14)' : 'transparent', color: active ? '#09090b' : '#a1a1aa',
        border: active ? 'none' : '1px solid #3f3f46', transition: 'all 0.25s ease', boxShadow: active ? '0 4px 12px rgba(57, 255, 20, 0.2)' : 'none' }}>
      {children}
    </button>
  );

  return (
    <div className="d-flex flex-column h-100 px-4 py-4 mb-5 pb-5 page-enter">
      <div className="d-flex align-items-center mb-1">
        <button className="btn btn-sm rounded-circle me-3 border-0" onClick={() => navigate('/dashboard')} style={{background: 'rgba(57, 255, 20, 0.06)', color: '#39ff14', width: '40px', height: '40px'}}><i className="bi bi-arrow-left fs-4"></i></button>
        <h2 className="fw-bold mb-0 text-white"><i className="bi bi-droplet-half me-2" style={{color: '#39ff14'}}></i> Farm Details</h2>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <p className="mb-0 small" style={{color: '#71717a'}}>Select your conditions for AI analysis.</p>
        <button className="btn btn-link btn-sm text-decoration-none p-0 fw-bold" style={{color: '#39ff14'}} onClick={resetForm}><i className="bi bi-arrow-counterclockwise me-1"></i>Reset</button>
      </div>

      <div className="flex-grow-1 overflow-auto">
        <h6 className="text-uppercase fw-bold mb-2 small" style={{color: '#39ff14', letterSpacing: '0.05em'}}>Soil Type</h6>
        <div className="d-flex gap-2 flex-wrap mb-4">{soilOptions.map(opt => <PillButton key={opt.name} active={soilType === opt.name} onClick={() => setSoilType(opt.name)}>{opt.icon} {opt.name}</PillButton>)}</div>
        <h6 className="text-uppercase fw-bold mb-2 small" style={{color: '#39ff14', letterSpacing: '0.05em'}}>Water Availability</h6>
        <div className="d-flex gap-2 flex-wrap mb-4">{['Low', 'Medium', 'High'].map(opt => <PillButton key={opt} active={waterStatus === opt} onClick={() => setWaterStatus(opt)}><i className="bi bi-droplet me-1"></i>{opt}</PillButton>)}</div>
        <h6 className="text-uppercase fw-bold mb-2 small" style={{color: '#39ff14', letterSpacing: '0.05em'}}>Sunlight</h6>
        <div className="d-flex gap-2 flex-wrap mb-4">{['Low', 'Partial', 'Full'].map(opt => <PillButton key={opt} active={sunlight === opt} onClick={() => setSunlight(opt)}><i className="bi bi-brightness-high me-1"></i>{opt}</PillButton>)}</div>
        <h6 className="text-uppercase fw-bold mb-2 small" style={{color: '#39ff14', letterSpacing: '0.05em'}}>Land Size (Acres)</h6>
        <input type="number" className="form-control form-control-lg mb-4" style={{background: 'rgba(9, 9, 11, 0.6)', border: '1.5px solid #3f3f46', color: '#fafafa'}} value={landSize} onChange={(e) => setLandSize(e.target.value)} placeholder="e.g. 2.5" min="0.1" step="0.1" />
      </div>
      <button className="btn btn-success btn-lg w-100 shadow fw-bold" onClick={() => navigate('/crops', { state: { soilType, waterStatus, sunlight, landSize: parseFloat(landSize) || 1, weatherData } })} disabled={!landSize}>
        Analyze Farm <i className="bi bi-magic ms-2"></i>
      </button>
    </div>
  );
}

export default SoilInputPage;
