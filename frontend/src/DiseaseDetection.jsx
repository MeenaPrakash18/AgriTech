import React, { useState, useRef } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from './apiConfig';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './NotificationContext';

function DiseaseDetection() {
  const navigate = useNavigate();
  const { sendManualAlert } = useNotification();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertStatus, setAlertStatus] = useState(null); // 'success', 'error'
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('organic');
  const fileInputRef = useRef(null);
  const NC = '#39ff14';
  const NCS = (o) => `rgba(57, 255, 20, ${o})`;

  const processFile = (selected) => { if (selected?.type.startsWith('image/')) { setFile(selected); setPreview(URL.createObjectURL(selected)); setResult(null); } };

  const getMockResult = () => {
    const diseases = [
      { 
        disease: "Tomato___Early_blight", 
        confidence: 92.4, 
        organicRemedies: ["Baking soda + soap spray.", "Mulching with straw.", "Prune bottom 12 inches."],
        preventionTips: ["Maintain 3-foot spacing.", "Rotate every 3 years."],
        chemicalTreatment: "Chlorothalonil applied every 7-10 days."
      },
      { 
        disease: "Powdery Mildew", 
        confidence: 88.7, 
        organicRemedies: ["Milk Spray: 40% milk and 60% water.", "Neem Oil: 7-day schedule."],
        preventionTips: ["Full Sun: At least 6 hours daily.", "Thinning: Ensure inner leaf drying."],
        chemicalTreatment: "Sulfur-based fungicides."
      },
      { 
        disease: "Leaf Rust", 
        confidence: 85.2, 
        organicRemedies: ["Sulfur Dust: Apply early morning.", "Compost Tea: Foliar spray."],
        preventionTips: ["Aerate: Space plants 2-3 feet apart.", "Timing: Don't work when plants are wet."],
        chemicalTreatment: "Propiconazole or Triadimefon."
      },
      { 
        disease: "Healthy Leaf (No Disease)", 
        confidence: 98.1, 
        organicRemedies: [
          "Optimal Hydration: Water deeply at the base early in the morning to prevent prolonged leaf wetness and fungal growth.",
          "Nutrient Management: Apply a balanced, slow-release organic fertilizer every 4-6 weeks to sustain vigorous growth.",
          "Soil Health: Apply a 2-3 inch layer of organic mulch to retain moisture and regulate soil temperature."
        ],
        preventionTips: [
          "Weekly Inspections: Examine the undersides of leaves and new growth twice a week for early signs of pests.",
          "Airflow Maintenance: Selectively prune overcrowded branches to ensure excellent air circulation.",
          "Garden Hygiene: Keep the surrounding area free of fallen debris and weeds."
        ],
        chemicalTreatment: "No chemical treatment required; Maintain current schedule."
      }
    ];
    return diseases[Math.floor(Math.random() * diseases.length)];
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData(); formData.append('image', file);
      const response = await axios.post(API_ENDPOINTS.DETECT_DISEASE, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(response.data);
    } catch (err) {
      setResult({
        disease: "Analysis Failed",
        confidence: 0.0,
        isLowConfidence: true,
        organicRemedies: ["An error occurred communicating with the server.", err.response?.data?.error || err.message],
        preventionTips: ["Ensure backend server is running."],
        chemicalTreatment: "Error"
      });
    }
    finally { setLoading(false); }
  };

  const resetAll = () => { setResult(null); setFile(null); setPreview(null); setAlertStatus(null); if(fileInputRef.current) fileInputRef.current.value = ""; };

  const handleSendToPhone = async () => {
    if (!result) return;
    setSendingAlert(true);
    setAlertStatus(null);
    
    const msg = `Disease Detected: ${result.disease} (${result.confidence}% confidence). Organic Remedy: ${result.organicRemedies?.[0] || 'See app for details.'}`;
    const res = await sendManualAlert(`⚠️ Plant Disease Alert`, msg);
    
    setSendingAlert(false);
    if (res.success) {
      setAlertStatus('success');
      setTimeout(() => setAlertStatus(null), 3000);
    } else {
      setAlertStatus('error');
      setTimeout(() => setAlertStatus(null), 3000);
    }
  };

  return (
    <div className="d-flex flex-column h-100 px-4 py-4 mb-5 pb-5 page-enter">
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-sm rounded-circle me-3 border-0" onClick={() => navigate('/dashboard')} style={{background: NCS(0.06), color: NC, width: '40px', height: '40px'}}><i className="bi bi-arrow-left fs-4"></i></button>
        <h2 className="fw-bold mb-0 text-white"><i className="bi bi-camera me-2" style={{color: NC}}></i> Scan Plant</h2>
      </div>

      {!result ? (
        <div className="flex-grow-1 d-flex flex-column justify-content-center">
          <div className="rounded-4 p-5 text-center mb-4"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length) processFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer', borderStyle: 'dashed', borderWidth: '2px', borderColor: isDragging ? NC : '#3f3f46', background: isDragging ? NCS(0.04) : 'rgba(24, 24, 27, 0.5)', transition: 'all 0.3s ease' }}>
            <input type="file" className="d-none" accept="image/*" capture="environment" onChange={(e) => processFile(e.target.files[0])} ref={fileInputRef} />
            {!preview ? (
              <div className="py-4">
                <div className="d-inline-block mb-3 p-3 rounded-circle" style={{background: NCS(0.08)}}><i className="bi bi-camera fs-1 d-block" style={{color: NC}}></i></div>
                <p className="fw-bold mb-1" style={{color: '#a1a1aa'}}>Tap to snap a photo</p>
                <p className="small mb-0" style={{color: '#52525b'}}>of the diseased leaf for AI analysis</p>
              </div>
            ) : (
              <div className="position-relative">
                <img src={preview} alt="Preview" className="img-fluid rounded shadow" style={{maxHeight:'200px', objectFit: 'cover'}} />
                <div className="position-absolute top-0 end-0 m-2"><button className="btn btn-sm btn-danger rounded-circle px-2" onClick={(e) => { e.stopPropagation(); resetAll(); }}><i className="bi bi-x fs-5"></i></button></div>
              </div>
            )}
          </div>
          <button className="btn btn-success btn-lg w-100 fw-bold shadow mt-auto" disabled={!file || loading} onClick={handleUpload}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span> Analyzing...</> : <><i className="bi bi-search me-2"></i> Identify Disease</>}
          </button>
        </div>
      ) : (
        <div className="flex-grow-1 d-flex flex-column animation-fade-in text-start">
          {result.isLowConfidence && (
            <div className="alert border-0 rounded-4 mb-4 p-3 d-flex align-items-center shadow-sm" style={{background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)'}}>
              <i className="bi bi-exclamation-triangle-fill me-3 fs-3" style={{color: '#f59e0b'}}></i>
              <div>
                <div className="fw-bold mb-0" style={{color: '#f59e0b', fontSize: '0.9rem'}}>Low confidence prediction</div>
                <div className="text-secondary small" style={{fontSize: '0.75rem'}}>Analysis unclear – results may not be accurate. Here is the most likely disease and treatment.</div>
              </div>
            </div>
          )}

          <div className="p-3 rounded-4 mb-4" style={{background: 'rgba(24, 24, 27, 0.8)', border: `1px solid ${NCS(0.08)}`}}>
            <div className="d-flex align-items-center mb-3">
              <img src={preview} alt="" className="rounded shadow-sm me-3" style={{width: '60px', height: '60px', objectFit: 'cover'}} />
              <div>
                <h4 className="fw-bold mb-1 lh-1" style={{color: result.disease === 'Healthy Leaf' ? NC : (result.isLowConfidence ? '#f59e0b' : '#f87171')}}>{result.disease}</h4>
                <div className="small" style={{color: '#a1a1aa'}}><i className="bi bi-check-circle-fill me-1" style={{color: NC}}></i>{result.confidence}% Confidence Match</div>
              </div>
            </div>
            
            <div className="progress rounded-pill" style={{height: '6px', background: '#27272a'}}>
              <div className="progress-bar rounded-pill" style={{width: `${result.confidence}%`, background: `linear-gradient(90deg, #22c55e, ${result.isLowConfidence ? '#f59e0b' : NC})`}}></div>
            </div>

            <button 
              className={`btn btn-sm w-100 mt-3 fw-bold rounded-3 py-2 transition-all ${alertStatus === 'success' ? 'btn-success' : alertStatus === 'error' ? 'btn-danger' : 'btn-outline-light'}`}
              onClick={handleSendToPhone}
              disabled={sendingAlert || alertStatus === 'success'}
              style={{ border: alertStatus ? 'none' : `1px solid ${NCS(0.2)}`, background: alertStatus === 'success' ? '#22c55e' : alertStatus === 'error' ? '#dc2626' : 'rgba(255,255,255,0.05)' }}
            >
              {sendingAlert ? (
                <><span className="spinner-border spinner-border-sm me-2"></span> Sending...</>
              ) : alertStatus === 'success' ? (
                <><i className="bi bi-check-circle-fill me-2"></i> Sent to Phone</>
              ) : alertStatus === 'error' ? (
                <><i className="bi bi-x-circle-fill me-2"></i> Link Phone in Alerts</>
              ) : (
                <><i className="bi bi-whatsapp me-2"></i> Send Alert to Linked Number</>
              )}
            </button>
          </div>

          <div className="glass-panel p-3 mb-4 rounded-4 shadow-sm" style={{border: `1px solid ${NCS(0.15)}`, background: 'rgba(24, 24, 27, 0.6)'}}>
            <h6 className="fw-bold mb-3 d-flex align-items-center" style={{color: NC}}>
              {result.disease?.includes('Healthy') ? (
                <><i className="bi bi-heart-pulse-fill me-2 fs-5"></i> Wellness Routine</>
              ) : result.disease?.includes('Unrecognized') ? (
                <><i className="bi bi-camera-fill me-2 fs-5"></i> Tips for Better Scanning</>
              ) : (
                <><i className="bi bi-leaf-fill me-2 fs-5"></i> Organic Remedies</>
              )}
            </h6>
            <div className="ps-1">
              {result.organicRemedies?.map((step, i) => (
                <div key={i} className="d-flex mb-3 align-items-start">
                  <div className="me-2 mt-1 rounded-circle d-flex align-items-center justify-content-center" style={{minWidth: '20px', height: '20px', background: NCS(0.1), color: NC, fontSize: '0.7rem', fontWeight: 'bold'}}>{i + 1}</div>
                  <p className="small mb-0 text-light" style={{lineHeight: '1.4'}}>{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-3 mb-4 rounded-4 shadow-sm" style={{border: `1px solid rgba(59, 130, 246, 0.2)`, background: 'rgba(24, 24, 27, 0.6)'}}>
            <h6 className="fw-bold mb-3 d-flex align-items-center" style={{color: '#60a5fa'}}>
              {result.disease?.includes('Healthy') ? (
                <><i className="bi bi-search me-2 fs-5"></i> Regular Scouting</>
              ) : result.disease?.includes('Unrecognized') ? (
                <><i className="bi bi-info-circle-fill me-2 fs-5"></i> Next Steps</>
              ) : (
                <><i className="bi bi-shield-check me-2 fs-5"></i> Prevention Tips</>
              )}
            </h6>
            <ul className="small mb-0 ps-3 text-secondary" style={{lineHeight: '1.5'}}>
              {result.preventionTips?.map((tip, i) => (
                <li key={i} className="mb-2">{tip}</li>
              ))}
            </ul>
          </div>

          {!result.disease?.includes('Healthy') && !result.disease?.includes('Unrecognized') && (
            <div className="glass-panel p-3 mb-4 rounded-4 shadow-sm" style={{border: `1px solid rgba(248, 113, 113, 0.15)`, background: 'rgba(24, 24, 27, 0.6)'}}>
              <h6 className="fw-bold mb-3 d-flex align-items-center" style={{color: '#f87171'}}>
                <i className="bi bi-flask-fill me-2 fs-5"></i> ⚗ Chemical Treatment
              </h6>
              <div className="ps-1">
                <p className="small mb-0 text-light" style={{lineHeight: '1.6'}}>
                  <i className="bi bi-info-circle-fill me-2" style={{color: '#f59e0b'}}></i>
                  {result.chemicalTreatment}
                </p>
              </div>
            </div>
          )}

          <button className="btn btn-outline-success btn-lg w-100 mt-auto fw-bold py-3 rounded-4" onClick={resetAll} style={{borderColor: NCS(0.3)}}>
            <i className="bi bi-arrow-counterclockwise me-2"></i> Scan Another Plant
          </button>
        </div>
      )}
    </div>
  );
}

export default DiseaseDetection;
