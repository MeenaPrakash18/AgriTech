import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function CropRecommendation({ weather }) {
  const { t } = useTranslation();
  const [soilType, setSoilType] = useState('Red');
  const [waterStatus, setWaterStatus] = useState('Medium');
  const [sunlight, setSunlight] = useState('Partial');
  const [landSize, setLandSize] = useState('');
  const [season, setSeason] = useState('Kharif');
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const soilOptions = ['Red', 'Black', 'Sandy', 'Clay'];
  const waterOptions = ['Low', 'Medium', 'High'];
  const sunlightOptions = ['Low', 'Partial', 'Full'];

  // Auto-detect season based on month
  useEffect(() => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 6 && month <= 10) setSeason('Kharif'); // June-Oct
    else if (month >= 11 || month <= 3) setSeason('Rabi'); // Nov-Mar
    else setSeason('Zaid'); // Apr-May
  }, []);

  const getRecommendation = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/recommend-crop', {
        soilType, waterStatus, sunlight, landSize: parseFloat(landSize) || 1, season,
        temperature: weather?.temperature || 25,
        windspeed: weather?.windspeed || 10,
        humidity: weather?.humidity || 50
      });
      setPrediction(response.data);
    } catch (err) {
      console.warn("Backend not running, using mock data.");
      const acres = parseFloat(landSize) || 1;
      setTimeout(() => {
        setPrediction({
          bestCrops: ["Tomato 🍅", "Chili 🌶️", "Cotton 🌿"],
          avoidCrops: ["Rice (Requires high water)"],
          expectedYield: `${(acres * 15).toFixed(1)} quintals`,
          revenue: acres * 60000,
          costs: {
            seed: acres * 2000,
            fertilizer: acres * 3000,
            water: waterStatus === 'Low' ? acres * 500 : acres * 1500
          },
          profitEstimate: `₹${(acres * 53500).toLocaleString()}`,
          waterTips: waterStatus === 'Low' ? "Use drip irrigation to conserve water." : "Normal watering schedules."
        });
        setLoading(false);
      }, 1500);
      return;
    }
    setLoading(false);
  };

  return (
    <div className="card h-100 border-top border-success border-4 shadow-sm pb-2">
      <div className="card-body d-flex flex-column p-4">
        <h5 className="card-title text-success mb-4">
          <i className="bi bi-robot me-2"></i>{t('AI_Setup', 'AI Crop Recommendation')}
        </h5>
        
        {!prediction ? (
          <div className="flex-grow-1 d-flex flex-column">
            <div className="mb-3">
              <label className="form-label small text-muted text-uppercase fw-bold mb-2">{t('SoilType', 'Soil Type')}</label>
              <div className="d-flex gap-2 flex-wrap">
                {soilOptions.map(opt => (
                  <button key={opt} onClick={() => setSoilType(opt)} 
                    className={`btn btn-sm px-3 rounded-pill ${soilType === opt ? 'btn-success fw-bold shadown-sm' : 'btn-outline-secondary'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small text-muted text-uppercase fw-bold mb-2">{t('WaterAvail', 'Water Availability')}</label>
              <div className="d-flex gap-2 flex-wrap">
                {waterOptions.map(opt => (
                  <button key={opt} onClick={() => setWaterStatus(opt)} 
                    className={`btn btn-sm px-3 rounded-pill ${waterStatus === opt ? 'btn-info text-dark fw-bold shadow-sm' : 'btn-outline-secondary'}`}>
                    <i className="bi bi-droplet me-1"></i>{opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small text-muted text-uppercase fw-bold mb-2">{t('Sunlight', 'Sunlight Exposure')}</label>
              <div className="d-flex gap-2 flex-wrap">
                {sunlightOptions.map(opt => (
                  <button key={opt} onClick={() => setSunlight(opt)} 
                    className={`btn btn-sm px-3 rounded-pill ${sunlight === opt ? 'btn-warning text-dark fw-bold shadow-sm' : 'btn-outline-secondary'}`}>
                    <i className="bi bi-brightness-high me-1"></i>{opt}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="row g-2 mb-4 mt-auto">
              <div className="col-8">
                <label className="form-label small text-muted text-uppercase fw-bold mb-2">{t('LandSize', 'Land Size (Acres)')}</label>
                <input type="number" className="form-control form-control-lg bg-dark text-white border-secondary" 
                  value={landSize} onChange={(e) => setLandSize(e.target.value)} placeholder="0.0" min="0.1" step="0.1" />
              </div>
              <div className="col-4">
                 <label className="form-label small text-muted text-uppercase fw-bold mb-2">Season</label>
                 <div className="form-control form-control-lg bg-dark text-white-50 border-secondary d-flex align-items-center justify-content-center">
                    {season}
                 </div>
              </div>
            </div>

            <button onClick={getRecommendation} disabled={!landSize || loading} className="btn btn-success btn-lg w-100 fw-bold shadow-sm mt-auto">
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span> Analyzing Data...</>
              ) : (
                <><i className="bi bi-magic me-2"></i> {t('GenerateInsights', 'Generate Insights')}</>
              )}
            </button>
          </div>
        ) : (
          <div className="flex-grow-1 d-flex flex-column animation-fade-in">
            <div className="bg-success bg-opacity-10 rounded p-3 mb-3 border border-success border-opacity-25">
              <p className="small text-success text-uppercase fw-bold mb-1">{t('BestCrops', 'Recommended Crops')}</p>
              <h4 className="mb-0 fw-bold text-white">{prediction.bestCrops.join(', ')}</h4>
            </div>
            
            <div className="bg-danger bg-opacity-10 rounded p-2 mb-3 border border-danger border-opacity-25">
              <p className="small text-danger text-uppercase fw-bold mb-1"><i className="bi bi-exclamation-triangle me-1"></i>{t('Avoid', 'Avoid Planting')}</p>
              <span className="text-white-50 small">{prediction.avoidCrops.join(', ')}</span>
            </div>
            
            {/* Profit Calculator Section */}
            <div className="glass-panel p-3 mb-3 text-start">
               <h6 className="text-info mb-3 fw-bold border-bottom border-secondary pb-2"><i className="bi bi-calculator me-2"></i>Profit Calculator</h6>
               <div className="d-flex justify-content-between small text-white-50 mb-1">
                 <span>{t('ExpectedYield', 'Expected Yield')}</span>
                 <span className="text-white fw-semibold">{prediction.expectedYield}</span>
               </div>
               <div className="d-flex justify-content-between small text-white-50 mb-1">
                 <span>Gross Revenue</span>
                 <span className="text-white fw-semibold">₹{prediction.revenue?.toLocaleString() || '---'}</span>
               </div>
               <div className="d-flex justify-content-between small text-white-50 mb-1 text-danger">
                 <span>Est. Costs (Seed/Fert/Water)</span>
                 <span>-₹{((prediction.costs?.seed || 0) + (prediction.costs?.fertilizer || 0) + (prediction.costs?.water || 0)).toLocaleString()}</span>
               </div>
               <hr className="border-secondary my-2" />
               <div className="d-flex justify-content-between align-items-center">
                 <span className="text-success fw-bold small text-uppercase">{t('EstimatedProfit', 'Net Profit')}</span>
                 <h5 className="text-success fw-bold mb-0">{prediction.profitEstimate}</h5>
               </div>
            </div>

            <div className="bg-info bg-opacity-10 rounded p-2 small mb-3 text-info">
              <i className="bi bi-info-circle me-2"></i>{prediction.waterTips}
            </div>
            
            <button onClick={() => setPrediction(null)} className="btn btn-outline-secondary w-100 mt-auto">
              <i className="bi bi-arrow-counterclockwise me-2"></i>Reset Parameters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CropRecommendation;
