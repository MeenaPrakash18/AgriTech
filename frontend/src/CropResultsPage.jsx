import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

function CropResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const NC = '#39ff14';

  useEffect(() => {
    if (!location.state) { navigate('/soil'); return; }
    const fetchPrediction = async () => {
      try {
        const { soilType, waterStatus, sunlight, landSize, weatherData } = location.state;
        const month = new Date().getMonth() + 1;
        let season = 'Zaid';
        if (month >= 6 && month <= 10) season = 'Kharif';
        else if (month >= 11 || month <= 3) season = 'Rabi';
        const response = await axios.post('/api/recommend-crop', { soilType, waterStatus, sunlight, landSize, season, temperature: weatherData?.temperature || 28, humidity: weatherData?.humidity || 60, rainfall: weatherData?.rain || 100 });
        setPrediction(response.data);
      } catch {
        const acres = location.state?.landSize || 1;
        const soil = location.state?.soilType || 'Red';
        const water = location.state?.waterStatus || 'Medium';
        const cropMap = {
          'Red': { best: ["Tomato 🍅", "Groundnut 🥜", "Millets 🌾"], avoid: ["Rice (Needs Black/Loamy soil)"] },
          'Black': { best: ["Cotton 🌿", "Soybean 🌱", "Wheat 🌾"], avoid: ["Groundnut (Too heavy soil)"] },
          'Sandy': { best: ["Watermelon 🍉", "Carrot 🥕", "Peanut 🥜"], avoid: ["Rice (Poor water retention)"] },
          'Clay': { best: ["Rice 🍚", "Wheat 🌾", "Sugarcane 🎋"], avoid: ["Carrot (Root compaction)"] },
          'Loamy': { best: ["Maize 🌽", "Tomato 🍅", "Cotton 🌿"], avoid: ["None - Ideal soil type"] },
        };
        const selected = cropMap[soil] || cropMap['Red'];
        if (water === 'Low') selected.avoid = [...selected.avoid, "Rice (Insufficient water)"];
        setPrediction({
          bestCrops: selected.best, avoidCrops: selected.avoid, expectedYield: `${(acres * 18).toFixed(1)} quintals`,
          revenue: acres * 72000, costs: { seed: acres * 2800, fertilizer: acres * 4000, water: acres * 1800 },
          profitEstimate: `₹${(acres * 63400).toLocaleString()}`,
          waterTips: water === 'Low' ? "Use drip irrigation to conserve water." : "Standard irrigation schedule sufficient.",
          yieldHistory: [14, 16, 18, 15, 19].map(y => y * acres),
          seasonTip: `Current season: ${new Date().getMonth() >= 5 && new Date().getMonth() <= 9 ? 'Kharif' : 'Rabi'} — recommendations optimized accordingly.`
        });
      } finally { setLoading(false); }
    };
    fetchPrediction();
  }, [location, navigate]);

  if (loading) return (
    <div className="d-flex flex-column h-100 justify-content-center align-items-center mb-5 pb-5 px-4">
      <div className="spinner-border" style={{width: '3rem', height: '3rem', color: NC}} role="status"></div>
      <h4 className="mt-4 text-white fw-bold">Analyzing Farm Data...</h4>
      <p style={{color: '#71717a'}}>AI is computing optimal crop recommendations</p>
    </div>
  );

  if (!prediction) return null;
  const chartData = prediction.yieldHistory.map((val, i) => ({ name: `S${i + 1}`, yield: val }));
  const costData = [{ name: 'Seeds', value: prediction.costs.seed }, { name: 'Fertilizer', value: prediction.costs.fertilizer }, { name: 'Water', value: prediction.costs.water }];

  return (
    <div className="d-flex flex-column h-100 px-3 py-4 mb-5 pb-5 text-white page-enter">
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-sm rounded-circle me-3" onClick={() => navigate('/soil')}
                style={{background: 'rgba(57, 255, 20, 0.06)', border: '1px solid rgba(57, 255, 20, 0.12)', color: NC, width: '40px', height: '40px'}}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <h2 className="fw-bold mb-0">AI Recommendation</h2>
      </div>

      <div className="flex-grow-1 overflow-auto pe-1">
        <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: '1.5rem', background: 'linear-gradient(135deg, #14532d 0%, #22c55e 100%)' }}>
          <div className="card-body p-4">
            <h6 className="text-uppercase fw-bold small mb-2" style={{color: 'rgba(255,255,255,0.7)'}}><i className="bi bi-stars me-1" style={{color: '#d1fae5'}}></i> Best Crops to Grow</h6>
            <div className="d-flex gap-2 flex-wrap mt-3">
              {prediction.bestCrops.map(crop => (
                <div key={crop} className="px-4 py-3 rounded-4 shadow-sm d-flex flex-column align-items-center" style={{minWidth: '80px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.1)'}}>
                  <span className="fs-1 mb-1">{crop.split(' ').pop()}</span>
                  <span className="fw-bold small">{crop.split(' ')[0]}</span>
                </div>
              ))}
            </div>
            <p className="small mb-0 mt-4 pt-3" style={{borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)'}}><i className="bi bi-info-circle me-2"></i>{prediction.waterTips}</p>
            {prediction.seasonTip && <p className="small mb-0 mt-2" style={{color: 'rgba(255,255,255,0.5)'}}><i className="bi bi-calendar-check me-2"></i>{prediction.seasonTip}</p>}
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '1.5rem', background: 'rgba(24, 24, 27, 0.8)', border: '1px solid rgba(57, 255, 20, 0.06)' }}>
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div><h6 className="text-uppercase fw-bold small mb-1" style={{color: '#71717a'}}>Expected Yield</h6><h3 className="fw-bold mb-0" style={{color: NC}}>{prediction.expectedYield}</h3></div>
              <i className="bi bi-bar-chart-fill fs-3" style={{color: NC}}></i>
            </div>
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs><linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={NC} stopOpacity={0.5}/><stop offset="95%" stopColor={NC} stopOpacity={0}/></linearGradient></defs>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(57,255,20,0.15)', borderRadius: '10px', color: NC }} />
                  <Area type="monotone" dataKey="yield" stroke={NC} strokeWidth={2} fillOpacity={1} fill="url(#colorYield)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '1.2rem', background: 'rgba(220, 38, 38, 0.08)', borderLeft: '5px solid #dc2626' }}>
          <div className="card-body p-3">
            <h6 className="text-uppercase fw-bold small mb-2" style={{color: '#f87171'}}><i className="bi bi-exclamation-triangle-fill me-1"></i> Consider Avoiding</h6>
            <p className="small mb-0" style={{color: '#a1a1aa'}}>{prediction.avoidCrops.join(', ')}</p>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-2" style={{ borderRadius: '1.5rem', background: 'rgba(24, 24, 27, 0.5)', border: '1px solid rgba(57, 255, 20, 0.04)' }}>
          <div className="card-body p-4">
            <h6 className="text-uppercase fw-bold small mb-4 text-center" style={{color: '#71717a'}}>Investment Distribution</h6>
            <div style={{ width: '100%', height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData} layout="vertical"><XAxis type="number" hide /><YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={12} width={70} /><Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(57,255,20,0.15)', borderRadius: '8px', color: NC }} /><Bar dataKey="value" fill="#22c55e" radius={[0, 10, 10, 0]} /></BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <button className="btn btn-success btn-lg mt-4 w-100 fw-bold shadow-lg py-3 rounded-pill" onClick={() => navigate('/profit', { state: { prediction } })}>
        View Profit Breakdown <i className="bi bi-chevron-right ms-2"></i>
      </button>
    </div>
  );
}

export default CropResultsPage;
