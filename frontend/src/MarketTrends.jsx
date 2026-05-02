import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from './apiConfig';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useNotification } from './NotificationContext';

function MarketTrends() {
  const navigate = useNavigate();
  const { sendManualAlert } = useNotification();
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertStatus, setAlertStatus] = useState(null);
  const NC = '#39ff14';
  const NCS = (o) => `rgba(57, 255, 20, ${o})`;

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const locStr = localStorage.getItem('agritech_location');
        const loc = locStr ? JSON.parse(locStr) : { latitude: 12.97, longitude: 77.59 };
        const response = await axios.post(API_ENDPOINTS.MARKET_PRICES, { location: loc });
        setMarketData(response.data);
        if (response.data.length > 0) setSelectedCrop(response.data[0]);
      } catch {
        const crops = [
          { crop: "Wheat", base: 2200, v: 0.05 }, { crop: "Rice", base: 3100, v: 0.03 }, { crop: "Tomato", base: 1500, v: 0.15 },
          { crop: "Cotton", base: 6000, v: 0.04 }, { crop: "Sugarcane", base: 315, v: 0.02 }, { crop: "Maize", base: 2090, v: 0.06 },
          { crop: "Onion", base: 2500, v: 0.20 }, { crop: "Soybean", base: 4600, v: 0.05 },
        ];
        const mock = crops.map(c => {
          const history = Array.from({length: 7}).map(() => Math.round(c.base * (1 + (Math.random() - 0.5) * 2 * c.v)));
          return { crop: c.crop, currentPrice: history[6], prevPrice: history[5], trend: history[6] > history[5] ? 'up' : 'down', history };
        });
        setMarketData(mock);
        if (mock.length > 0) setSelectedCrop(mock[0]);
      } finally { setLoading(false); }
    };
    fetchMarket();
  }, []);

  if (loading) return <div className="d-flex justify-content-center align-items-center h-100"><div className="spinner-border" style={{color: NC}} role="status"></div></div>;

  const bestToSell = [...marketData].sort((a, b) => ((b.currentPrice - b.prevPrice) / b.prevPrice) - ((a.currentPrice - a.prevPrice) / a.prevPrice))[0];
  const chartData = selectedCrop ? selectedCrop.history.map((val, i) => ({ day: `Day ${i+1}`, price: val })) : [];

  return (
    <div className="d-flex flex-column h-100 px-3 py-4 mb-5 pb-5 text-white animation-fade-in page-enter">
      <div className="d-flex align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-25">
        <button className="btn btn-sm rounded-circle me-3 border-0" onClick={() => navigate('/dashboard')} style={{background: NCS(0.06), color: NC, width: '40px', height: '40px'}}><i className="bi bi-arrow-left fs-4"></i></button>
        <div>
          <h2 className="fw-bold mb-0 text-white"><i className="bi bi-graph-up-arrow me-2" style={{color: NC}}></i> Live Market</h2>
          {selectedCrop && <p className="small mb-0 mt-1" style={{color: '#a1a1aa'}}><i className="bi bi-geo-alt-fill me-1"></i> Mandi prices for {selectedCrop.state}</p>}
        </div>
      </div>

      {bestToSell && (
        <div className="glass-panel border-0 rounded-4 p-4 mb-4 mx-2 d-flex align-items-center shadow-lg"
             style={{background: `linear-gradient(135deg, ${NCS(0.08)} 0%, rgba(9, 9, 11, 0.8) 100%)`, border: `1px solid ${NCS(0.15)}`}}>
          <div className="me-3 rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-lg"
               style={{width:'56px', height:'56px', background: `linear-gradient(135deg, #22c55e, ${NC})`, color: '#09090b'}}>
            <i className="bi bi-lightning-charge-fill fs-4"></i>
          </div>
          <div className="flex-grow-1">
            <p className="small text-uppercase fw-bold mb-0" style={{color: NC}}>Market Opportunity</p>
            <h4 className="mb-0 text-white fw-bold">Sell {bestToSell.crop} Now</h4>
          </div>
          <div className="text-end">
            <div className="fw-bold" style={{color: NC}}>+{((bestToSell.currentPrice - bestToSell.prevPrice)/bestToSell.prevPrice * 100).toFixed(1)}%</div>
          </div>
        </div>
      )}

      {selectedCrop && (
        <div className="mx-2 mb-4 p-4 glass-panel rounded-4 shadow-sm" style={{border: `1px solid ${NCS(0.06)}`}}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div><h5 className="fw-bold mb-0" style={{color: NC}}>{selectedCrop.crop} Price Trend</h5><p className="small mb-0" style={{color: '#71717a'}}>Last 7 days</p></div>
            <div className="text-end">
              <h4 className="fw-bold mb-0 text-white">₹{selectedCrop.currentPrice}</h4>
              <div className="small fw-bold" style={{color: selectedCrop.trend === 'up' ? NC : '#f87171'}}>
                <i className={`bi bi-caret-${selectedCrop.trend === 'up' ? 'up' : 'down'}-fill me-1`}></i>{Math.abs(selectedCrop.currentPrice - selectedCrop.prevPrice)}
              </div>
            </div>
          </div>
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs><linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={NC} stopOpacity={0.25}/><stop offset="95%" stopColor={NC} stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="day" stroke="#3f3f46" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: `1px solid ${NCS(0.15)}`, borderRadius: '8px', color: NC }} itemStyle={{ color: NC }} />
                <Area type="monotone" dataKey="price" stroke={NC} strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <button 
            className={`btn btn-sm w-100 mt-3 fw-bold rounded-3 py-2 transition-all ${alertStatus === 'success' ? 'btn-success' : alertStatus === 'error' ? 'btn-danger' : 'btn-outline-light'}`}
            onClick={async () => {
              if (!selectedCrop) return;
              setSendingAlert(true);
              setAlertStatus(null);
              const msg = `Market Price Update: ${selectedCrop.crop} is currently at ₹${selectedCrop.currentPrice}/quintal (${selectedCrop.trend === 'up' ? '📈 Rising' : '📉 Falling'}). State: ${selectedCrop.state}.`;
              const res = await sendManualAlert(`💰 Price Alert: ${selectedCrop.crop}`, msg);
              setSendingAlert(false);
              setAlertStatus(res.success ? 'success' : 'error');
              setTimeout(() => setAlertStatus(null), 3000);
            }}
            disabled={sendingAlert || alertStatus === 'success'}
            style={{ border: alertStatus ? 'none' : `1px solid ${NCS(0.2)}`, background: alertStatus === 'success' ? '#22c55e' : alertStatus === 'error' ? '#dc2626' : 'rgba(255,255,255,0.05)' }}
          >
            {sendingAlert ? (
              <><span className="spinner-border spinner-border-sm me-2"></span> Sending...</>
            ) : alertStatus === 'success' ? (
              <><i className="bi bi-check-circle-fill me-2"></i> Sent to Phone</>
            ) : alertStatus === 'error' ? (
              <><i className="bi bi-x-circle-fill me-2"></i> Link Phone First</>
            ) : (
              <><i className="bi bi-whatsapp me-2"></i> Send Price Alert to Phone</>
            )}
          </button>
        </div>
      )}

      <div className="flex-grow-1 overflow-auto rounded-4 shadow-sm mx-2" style={{background: 'rgba(24, 24, 27, 0.5)', border: `1px solid ${NCS(0.04)}`}}>
        <table className="table table-dark table-hover table-borderless align-middle mb-0 bg-transparent">
          <thead className="small position-sticky top-0 z-1 shadow-sm" style={{color: '#71717a', borderBottom: `1px solid ${NCS(0.06)}`, background: '#18181b'}}>
            <tr><th className="fw-normal py-3 ps-3">Commodity</th><th className="fw-normal py-3">Price (₹/q)</th><th className="fw-normal py-3 pe-3 text-end">Action</th></tr>
          </thead>
          <tbody>
            {marketData.map((item, idx) => {
              const diff = item.currentPrice - item.prevPrice;
              return (
                <tr key={idx} style={{cursor: 'pointer', background: selectedCrop?.crop === item.crop ? NCS(0.03) : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.03)'}} onClick={() => setSelectedCrop(item)}>
                  <td className="ps-3 py-3"><span className="fw-bold d-block">{item.crop}</span></td>
                  <td className="py-3">
                    <div className="fw-bold">₹{item.currentPrice}</div>
                    <div className="small fw-semibold mt-1" style={{color: diff >= 0 ? NC : '#f87171', fontSize: '0.75rem'}}>
                      <i className={`bi bi-caret-${diff >= 0 ? 'up' : 'down'}-fill me-1`}></i>{Math.abs(diff)}
                    </div>
                  </td>
                  <td className="text-end py-3 pe-3">
                    <button className="btn btn-sm rounded-pill px-3 fw-bold"
                            style={diff > 100 ? {background: `linear-gradient(135deg, #22c55e, ${NC})`, color: '#09090b', border: 'none'} : {background: 'transparent', color: '#71717a', border: '1px solid #3f3f46'}}>
                      {diff > 100 ? 'SELL' : 'HOLD'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MarketTrends;
