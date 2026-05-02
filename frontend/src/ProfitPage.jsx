import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProfitPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPrediction = location.state?.prediction;
  
  const NC = '#39ff14';
  const NCS = (o) => `rgba(57, 255, 20, ${o})`;

  // Typical Indian Ag profiles per acre (Estimates)
  const CROP_PROFILES = {
    "Rice": { yield: 20, seed: 2500, fertilizer: 4000, water: 2500, labor: 6000, basePrice: 2000 },
    "Wheat": { yield: 18, seed: 2000, fertilizer: 3000, water: 1500, labor: 4000, basePrice: 2200 },
    "Maize": { yield: 25, seed: 2500, fertilizer: 3500, water: 1000, labor: 4000, basePrice: 2100 },
    "Tomato": { yield: 150, seed: 5000, fertilizer: 6000, water: 2000, labor: 8000, basePrice: 1500 },
    "Onion": { yield: 120, seed: 4000, fertilizer: 5000, water: 1500, labor: 7000, basePrice: 1600 },
    "Sugarcane": { yield: 300, seed: 8000, fertilizer: 7000, water: 5000, labor: 6000, basePrice: 340 },
    "Cotton": { yield: 8, seed: 3000, fertilizer: 4500, water: 1200, labor: 5000, basePrice: 6500 },
    "Ragi": { yield: 12, seed: 1200, fertilizer: 1500, water: 500, labor: 3000, basePrice: 3500 },
    "Coffee": { yield: 6, seed: 10000, fertilizer: 8000, water: 3000, labor: 12000, basePrice: 25000 },
    "Areca nut": { yield: 8, seed: 12000, fertilizer: 9000, water: 4000, labor: 15000, basePrice: 40000 },
    "Banana": { yield: 120, seed: 10000, fertilizer: 12000, water: 6000, labor: 8000, basePrice: 2500 },
    "Coconut": { yield: 40, seed: 5000, fertilizer: 4000, water: 2000, labor: 4000, basePrice: 4000 },
    "Turmeric": { yield: 25, seed: 15000, fertilizer: 8000, water: 3000, labor: 10000, basePrice: 12000 },
    "Apple": { yield: 80, seed: 20000, fertilizer: 10000, water: 4000, labor: 15000, basePrice: 6000 },
    "Mango": { yield: 40, seed: 8000, fertilizer: 6000, water: 2000, labor: 5000, basePrice: 5000 },
    "Potato": { yield: 200, seed: 15000, fertilizer: 7000, water: 1500, labor: 10000, basePrice: 1800 },
    "Chili": { yield: 15, seed: 6000, fertilizer: 7000, water: 2000, labor: 9000, basePrice: 18000 },
    "Lemon": { yield: 60, seed: 6000, fertilizer: 5000, water: 2500, labor: 6000, basePrice: 5000 },
    "Mustard": { yield: 8, seed: 1500, fertilizer: 2500, water: 800, labor: 3000, basePrice: 5500 },
    "Groundnut": { yield: 10, seed: 4000, fertilizer: 3000, water: 1000, labor: 4500, basePrice: 6500 },
    "Soybean": { yield: 12, seed: 3000, fertilizer: 3500, water: 800, labor: 4000, basePrice: 4800 },
    "Bajra": { yield: 10, seed: 1000, fertilizer: 1500, water: 400, labor: 2500, basePrice: 2200 },
    "Tobacco": { yield: 12, seed: 5000, fertilizer: 6000, water: 2500, labor: 8000, basePrice: 15000 },
    "Default": { yield: 15, seed: 2500, fertilizer: 3500, water: 1000, labor: 4000, basePrice: 2000 }
  };

  // 1. Calculator State
  const [landSize, setLandSize] = useState(initialPrediction ? 1 : 1); // acres
  const [marketPrice, setMarketPrice] = useState(2500); // per quintal
  const [baseYieldRate, setBaseYieldRate] = useState(15); // quintals per acre
  
  // Costs
  const [costs, setCosts] = useState({
    seed: initialPrediction?.costs?.seed || 2500,
    fertilizer: initialPrediction?.costs?.fertilizer || 3500,
    water: initialPrediction?.costs?.water || 1000,
    labor: 4000
  });

  const [loadingMarket, setLoadingMarket] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(initialPrediction?.bestCrops?.[0]?.split(' ')[0] || "Wheat");
  const [availableCrops, setAvailableCrops] = useState([]);
  const [predictedState, setPredictedState] = useState("");

  // 2. Fetch Live Market Price on Mount
  useEffect(() => {
    const fetchLivePrice = async () => {
      setLoadingMarket(true);
      try {
        const locStr = localStorage.getItem('agritech_location');
        const loc = locStr ? JSON.parse(locStr) : { latitude: 12.97, longitude: 77.59 };
        const apiBase = API_ENDPOINTS.MARKET_PRICES;
        console.log(`[ProfitEngine] Fetching live prices from: ${apiBase}`);
        const response = await axios.post(apiBase, { location: loc });
        
        const data = response.data;
        if(data && data.length > 0) {
          setPredictedState(data[0].state);
          setAvailableCrops(data);
          
          // Try to match the exact crop the user selected
          const cropObj = data.find(d => d.crop === selectedCrop);
          if (cropObj) {
            setMarketPrice(cropObj.currentPrice);
          } else {
            // If the specific crop isn't in this state's mandi list, just use generic base
            setMarketPrice(data[0].currentPrice); 
            setSelectedCrop(data[0].crop);
          }
          
          // Set Yield and Costs heuristically from profile
          const profile = CROP_PROFILES[cropObj?.crop || data[0].crop] || CROP_PROFILES.Default;
          setBaseYieldRate(profile.yield);
          setCosts(prev => ({
            ...prev,
            seed: profile.seed,
            fertilizer: profile.fertilizer,
            water: profile.water,
            labor: profile.labor
          }));
        }
      } catch (err) {
        console.error("Market Fetch Failed", err);
      } finally {
        setLoadingMarket(false);
      }
    };
    fetchLivePrice();
  }, []);

  // 3. Dynamic Calculation Engine
  const totalYield = Math.round(landSize * baseYieldRate);
  const grossRevenue = totalYield * marketPrice;
  const totalInvestment = (costs.seed + costs.fertilizer + costs.water + costs.labor) * landSize;
  const netProfit = grossRevenue - totalInvestment;
  const marginStr = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : "0.0";

  const handleCostChange = (e) => {
    const { name, value } = e.target;
    setCosts(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleCropChange = (e) => {
    const newCropName = e.target.value;
    setSelectedCrop(newCropName);
    
    // Case-insensitive search for the crop in our live mandi data
    const cropObj = availableCrops.find(d => 
      d.crop.trim().toLowerCase() === newCropName.trim().toLowerCase()
    );

    if (cropObj) {
      setMarketPrice(cropObj.currentPrice);
      const profile = CROP_PROFILES[cropObj.crop] || CROP_PROFILES.Default;
      setBaseYieldRate(profile.yield);
      setCosts(prev => ({
        ...prev,
        seed: profile.seed,
        fertilizer: profile.fertilizer,
        water: profile.water,
        labor: profile.labor
      }));
    } else {
      // Fallback: If not in live data, check if it's in our local profiles
      const profileName = Object.keys(CROP_PROFILES).find(k => k.toLowerCase() === newCropName.trim().toLowerCase());
      if (profileName) {
        const profile = CROP_PROFILES[profileName];
        setMarketPrice(profile.basePrice);
        setBaseYieldRate(profile.yield);
        setCosts(prev => ({
          ...prev,
          seed: profile.seed,
          fertilizer: profile.fertilizer,
          water: profile.water,
          labor: profile.labor
        }));
      }
    }
  };

  return (
    <div className="d-flex flex-column h-100 px-4 py-4 mb-5 pb-5 page-enter overflow-auto" style={{scrollbarWidth: 'none'}}>
      
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-sm rounded-circle me-3 border-0" onClick={() => navigate('/dashboard')} style={{background: NCS(0.06), color: NC, width: '40px', height: '40px'}}><i className="bi bi-arrow-left fs-4"></i></button>
        <h2 className="fw-bold mb-0 text-white"><i className="bi bi-calculator-fill me-2" style={{color: NC}}></i> Profit Engine</h2>
      </div>

      {/* Primary ROI Plaque */}
      <div className="card border-0 text-white mb-4 shadow-lg text-center position-relative overflow-hidden" style={{background: 'linear-gradient(135deg, #14532d 0%, #22c55e 100%)', borderRadius: '1.5rem'}}>
        <i className="bi bi-graph-up-arrow position-absolute" style={{fontSize: '8rem', color: 'rgba(255,255,255,0.05)', right: '-20px', bottom: '-20px'}}></i>
        <div className="card-body py-4 z-1 position-relative">
          <p className="mb-1 fw-semibold text-uppercase small" style={{color: 'rgba(255,255,255,0.8)'}}>Estimated Net Profit</p>
          <h1 className="fw-bold display-4 mb-3" style={{color: '#d1fae5', textShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
            {netProfit < 0 ? "-" : ""}₹{Math.abs(netProfit).toLocaleString()}
          </h1>
          <div className="d-flex justify-content-center gap-2">
            <span className="badge rounded-pill px-3 py-2 fw-bold shadow-sm" style={{background: 'rgba(255,255,255,0.2)', color: '#d1fae5'}}><i className="bi bi-percent me-1"></i>{marginStr}% Margin</span>
            <span className="badge rounded-pill px-3 py-2 fw-bold shadow-sm" style={{background: 'rgba(255,255,255,0.2)', color: '#d1fae5'}}>Total: ₹{grossRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="glass-panel border-0 mb-4 rounded-4 shadow-sm" style={{border: `1px solid ${NCS(0.06)}`}}>
        <div className="p-3" style={{background: 'rgba(9, 9, 11, 0.4)', borderBottom: `1px solid ${NCS(0.06)}`}}>
           <h6 className="fw-bold mb-0 text-white"><i className="bi bi-sliders me-2" style={{color: NC}}></i>Farm Parameters</h6>
        </div>
        
        <div className="p-4 d-flex flex-column gap-3">
          
          {/* Target Crop & Live Price */}
          <div className="row g-2 mb-2">
            <div className="col-7">
               <label className="form-label small text-secondary fw-bold mb-1">Target Crop</label>
               <input 
                 list="crop-list"
                 className="form-control text-white fw-bold bg-dark border-secondary bg-opacity-50 shadow-none" 
                 value={selectedCrop} 
                 onChange={handleCropChange}
                 placeholder="Type or select crop..."
               />
               <datalist id="crop-list">
                 {availableCrops.map((c, idx) => (
                   <option key={idx} value={c.crop} />
                 ))}
               </datalist>
            </div>
            <div className="col-5">
               <label className="form-label small text-secondary fw-bold mb-1">Live Mandi Price</label>
               <div className="input-group">
                 <span className="input-group-text bg-dark border-secondary text-secondary">₹</span>
                 {loadingMarket ? (
                   <input type="text" className="form-control text-white bg-dark border-secondary bg-opacity-50" value="..." readOnly />
                 ) : (
                   <input type="number" className="form-control text-white fw-bold border-success shadow-none" style={{background: NCS(0.05)}} value={marketPrice} onChange={(e) => setMarketPrice(parseInt(e.target.value) || 0)} />
                 )}
               </div>
               <div className="form-text" style={{fontSize: '0.65rem'}}><i className="bi bi-geo-alt-fill me-1" style={{color: NC}}></i>{predictedState || "Local"} rate</div>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between">
            <label className="form-label mb-0 text-white fw-semibold">Land Size (Acres)</label>
            <span className="badge rounded-pill px-3 py-2" style={{background: NCS(0.1), color: NC}}>{landSize} Acres</span>
          </div>
          <input type="range" className="form-range" min="1" max="50" step="1" value={landSize} onChange={(e) => setLandSize(parseFloat(e.target.value) || 1)} />

          <div className="d-flex align-items-center justify-content-between mt-2">
            <label className="form-label mb-0 text-white fw-semibold">Yield per Acre</label>
            <span className="badge rounded-pill px-3 py-2 bg-dark text-white border">{baseYieldRate} Quintals</span>
          </div>
          <input type="range" className="form-range" min="5" max="500" step="5" value={baseYieldRate} onChange={(e) => setBaseYieldRate(parseInt(e.target.value) || 15)} />
          
        </div>
      </div>

      {/* Input Costs Configuration */}
      <div className="glass-panel border-0 mb-4 rounded-4 shadow-sm" style={{border: `1px solid ${NCS(0.06)}`}}>
        <div className="p-3 d-flex justify-content-between align-items-center" style={{background: 'rgba(9, 9, 11, 0.4)', borderBottom: `1px solid ${NCS(0.06)}`}}>
           <h6 className="fw-bold mb-0 text-white"><i className="bi bi-cash-stack me-2" style={{color: '#f87171'}}></i>Input Costs (per acre)</h6>
           <span className="badge rounded-pill px-3 py-1 bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">-₹{totalInvestment.toLocaleString()}</span>
        </div>
        
        <div className="p-4 d-flex flex-column gap-3">
          
          <div className="input-group">
            <span className="input-group-text bg-dark border-secondary text-secondary" style={{width: '40px'}}><i className="bi bi-flower1"></i></span>
            <span className="input-group-text bg-dark border-secondary text-white" style={{width: '100px'}}>Seeds</span>
            <input type="number" className="form-control text-white bg-dark border-secondary text-end" name="seed" value={costs.seed} onChange={handleCostChange} />
          </div>

          <div className="input-group">
            <span className="input-group-text bg-dark border-secondary text-secondary" style={{width: '40px'}}><i className="bi bi-bag-fill"></i></span>
            <span className="input-group-text bg-dark border-secondary text-white" style={{width: '100px'}}>Fertilizer</span>
            <input type="number" className="form-control text-white bg-dark border-secondary text-end" name="fertilizer" value={costs.fertilizer} onChange={handleCostChange} />
          </div>

          <div className="input-group">
            <span className="input-group-text bg-dark border-secondary text-secondary" style={{width: '40px'}}><i className="bi bi-droplet-fill"></i></span>
            <span className="input-group-text bg-dark border-secondary text-white" style={{width: '100px'}}>Water</span>
            <input type="number" className="form-control text-white bg-dark border-secondary text-end" name="water" value={costs.water} onChange={handleCostChange} />
          </div>

          <div className="input-group">
            <span className="input-group-text bg-dark border-secondary text-secondary" style={{width: '40px'}}><i className="bi bi-people-fill"></i></span>
            <span className="input-group-text bg-dark border-secondary text-white" style={{width: '100px'}}>Labor</span>
            <input type="number" className="form-control text-white bg-dark border-secondary text-end" name="labor" value={costs.labor} onChange={handleCostChange} />
          </div>

        </div>
      </div>

      {/* Analysis Footer */}
      <div className="text-center p-3 opacity-50">
        <p className="small text-secondary mb-0">Calculations are estimates based on regional averages and live mandi trends.</p>
      </div>

    </div>
  );
}

export default ProfitPage;
