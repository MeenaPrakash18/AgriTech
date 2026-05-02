import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './NotificationContext';

function GovSchemes() {
  const navigate = useNavigate();
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Dynamic Context States
  const { sendManualAlert } = useNotification();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingAlert, setSendingAlert] = useState(null) // ID of current sending scheme
  const [alertStatus, setAlertStatus] = useState({}); // ID -> 'success' | 'error'
  const [stateFilter, setStateFilter] = useState('All');
  const [farmerFilter, setFarmerFilter] = useState('All');
  
  const NC = '#39ff14';
  const NCS = (o) => `rgba(57, 255, 20, ${o})`;

  const states = ['All', 'Karnataka', 'Punjab', 'Gujarat', 'Uttar Pradesh', 'Andhra Pradesh', 'Telangana', 'Odisha', 'Madhya Pradesh'];
  const farmerTypes = ['All', 'Marginal', 'Small', 'Large'];

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const response = await axios.post(API_ENDPOINTS.GOV_SCHEMES, {
          state: stateFilter,
          farmerType: farmerFilter
        });
        setSchemes(response.data);
      } catch (err) {
        console.error("Failed to fetch schemes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, [stateFilter, farmerFilter]);

  const filteredSchemes = schemes.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="d-flex flex-column h-100 px-3 py-4 mb-5 pb-5 page-enter overflow-auto" style={{scrollbarWidth: 'none'}}>
      
      {/* Header */}
      <div className="d-flex align-items-center mb-4 border-bottom pb-2 border-secondary border-opacity-25">
        <button className="btn btn-sm rounded-circle me-3 border-0" onClick={() => navigate('/dashboard')} style={{background: NCS(0.06), color: NC, width: '40px', height: '40px'}}><i className="bi bi-arrow-left fs-4"></i></button>
        <div>
           <h2 className="fw-bold mb-0 text-white"><i className="bi bi-bank2 me-2" style={{color: NC}}></i>Govt Schemes</h2>
           <p className="small mb-0 mt-1" style={{color: '#a1a1aa'}}>Verified subsidies and grants.</p>
        </div>
      </div>

      {/* Primary Search Bar */}
      <div className="px-2 mb-3">
        <div className="input-group shadow-sm">
          <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-search"></i></span>
          <input type="text" className="form-control bg-dark border-secondary text-white shadow-none" placeholder="Search actively filtered schemes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* INTERACTIVE SMART FILTERS */}
      <div className="glass-panel px-3 py-3 mx-2 mb-4 rounded-4 shadow-sm" style={{border: `1px solid ${NCS(0.1)}`}}>
         <h6 className="fw-bold mb-3 small" style={{color: '#71717a'}}>ELIGIBILITY ENGINE</h6>
         
         <div className="mb-3">
           <label className="form-label small text-white fw-bold mb-1"><i className="bi bi-geo-alt-fill me-1" style={{color: NC}}></i> Regional Jurisdiction</label>
           <select className="form-select bg-dark text-white border-secondary shadow-none" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
             {states.map(s => <option key={s} value={s}>{s === 'All' ? 'All India (Central Schemes Only)' : s}</option>)}
           </select>
         </div>

         <div>
           <label className="form-label small text-white fw-bold mb-2"><i className="bi bi-person-badge-fill me-1" style={{color: NC}}></i> Farmer Classification</label>
           <div className="d-flex flex-wrap gap-2">
             {farmerTypes.map(ft => (
               <button 
                 key={ft} 
                 className={`btn btn-sm rounded-pill fw-bold ${farmerFilter === ft ? '' : 'btn-outline-secondary'}`}
                 style={farmerFilter === ft ? {background: NC, color: '#09090b', border: 'none'} : {color: '#d4d4d8'}}
                 onClick={() => setFarmerFilter(ft)}
               >
                 {ft === 'All' ? 'All Sizes' : `${ft} Farmer`}
               </button>
             ))}
           </div>
         </div>
      </div>

      {/* Meta Bar */}
      <div className="d-flex gap-2 px-2 mb-4">
        <div className="flex-fill text-center py-2 rounded-3" style={{background: NCS(0.04), border: `1px solid ${NCS(0.08)}`}}><div className="fw-bold" style={{color: NC}}>{schemes.length}</div><div className="small" style={{color: '#71717a'}}>Matches</div></div>
        <div className="flex-fill text-center py-2 rounded-3" style={{background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.08)'}}><div className="fw-bold" style={{color: NC}}>{filteredSchemes.filter(s=>s.status==='Active').length}</div><div className="small" style={{color: '#71717a'}}>Active</div></div>
      </div>

      {/* Fetching State */}
      {loading ? (
         <div className="d-flex flex-column align-items-center justify-content-center py-5">
           <div className="spinner-border mb-3" style={{color: NC}} role="status"></div>
           <p className="text-secondary fw-bold">Querying verified government databases...</p>
         </div>
      ) : filteredSchemes.length === 0 ? (
         <div className="text-center py-5">
           <i className="bi bi-clipboard-x display-1 text-secondary opacity-50 mb-3"></i>
           <h5 className="text-white fw-bold">No Subsidies Found</h5>
           <p className="text-secondary small">Try adjusting your state or farmer type filters.</p>
         </div>
      ) : (
      /* Accordion Renderer */
      <div className="px-2">
        {filteredSchemes.map((scheme, idx) => (
          <div className="mb-3 rounded-4 overflow-hidden" key={idx} style={{background: 'rgba(24, 24, 27, 0.6)', border: activeAccordion === idx ? `1px solid ${NCS(0.15)}` : '1px solid rgba(255,255,255,0.04)', transition: 'all 0.3s ease'}}>
            
            <button className="w-100 d-flex align-items-center p-3 border-0 text-start" style={{background: 'transparent', color: '#fafafa', cursor: 'pointer'}} onClick={() => setActiveAccordion(activeAccordion === idx ? -1 : idx)}>
              <div className="rounded-3 p-2 me-3 flex-shrink-0 d-flex align-items-center justify-content-center" style={{background: NCS(0.08), width: '48px', height: '48px'}}><i className={`bi ${scheme.icon} fs-4`} style={{color: NC}}></i></div>
              <div className="flex-grow-1">
                 <span className="fw-bold fs-6 d-block lh-sm mb-1">{scheme.title}</span>
                 <span className="badge rounded-pill bg-dark border border-secondary text-secondary me-2" style={{fontSize: '0.65rem'}}>{scheme.category.toUpperCase()}</span>
                 <span className={`badge rounded-pill ${scheme.status === 'Active' ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-warning bg-opacity-10 text-warning border border-warning'}`} style={{fontSize: '0.65rem'}}>{scheme.status}</span>
              </div>
              <i className={`bi bi-chevron-${activeAccordion === idx ? 'up' : 'down'} ms-2`} style={{color: NC}}></i>
            </button>
            
            {activeAccordion === idx && (
              <div className="px-4 pb-4 animation-fade-in" style={{borderTop: `1px solid ${NCS(0.04)}`}}>
                <p className="mb-4 mt-3 small" style={{color: '#d4d4d8', lineHeight: '1.6'}}>{scheme.desc}</p>
                
                {/* Details List */}
                <div className="d-flex flex-column gap-2 mb-4">
                   <div className="rounded-3 p-3" style={{background: 'rgba(9,9,11,0.5)', border: `1px solid ${NCS(0.04)}`}}>
                     <div className="fw-bold mb-1 small text-uppercase" style={{color: NC}}><i className="bi bi-check-circle-fill me-2"></i>Eligibility</div>
                     <div className="small" style={{color: '#e4e4e7'}}>{scheme.eligibility}</div>
                   </div>
                   <div className="rounded-3 p-3" style={{background: 'rgba(9,9,11,0.5)', border: `1px solid ${NCS(0.04)}`}}>
                     <div className="fw-bold mb-1 small text-uppercase" style={{color: NC}}><i className="bi bi-wallet-fill me-2"></i>Financial Benefit</div>
                     <div className="small fw-bold" style={{color: '#e4e4e7'}}>{scheme.amount}</div>
                   </div>
                   <div className="rounded-3 p-3" style={{background: 'rgba(9,9,11,0.5)', border: `1px solid ${NCS(0.04)}`}}>
                     <div className="fw-bold mb-1 small text-uppercase" style={{color: '#f59e0b'}}><i className="bi bi-hourglass-split me-2"></i>Deadline Status</div>
                     <div className="small" style={{color: '#e4e4e7'}}>{scheme.deadline}</div>
                   </div>
                   <div className="rounded-3 p-3" style={{background: 'rgba(9,9,11,0.5)', border: `1px solid ${NCS(0.04)}`}}>
                     <div className="fw-bold mb-1 small text-uppercase" style={{color: '#38bdf8'}}><i className="bi bi-file-earmark-text-fill me-2"></i>Application Process</div>
                     <div className="small" style={{color: '#e4e4e7'}}>{scheme.apply}</div>
                   </div>
                </div>

                <button 
                   className={`btn w-100 fw-bold rounded-pill p-2 mb-2 transition-all ${alertStatus[idx] === 'success' ? 'btn-success' : alertStatus[idx] === 'error' ? 'btn-danger' : 'btn-outline-light'}`}
                   style={{ border: alertStatus[idx] ? 'none' : `1px solid ${NCS(0.25)}`, background: alertStatus[idx] === 'success' ? '#22c55e' : alertStatus[idx] === 'error' ? '#dc2626' : 'rgba(255,255,255,0.05)', color: alertStatus[idx] ? '#fff' : '#d4d4d8' }}
                   disabled={sendingAlert === idx || alertStatus[idx] === 'success'}
                   onClick={async () => {
                     setSendingAlert(idx);
                     const msg = `Scheme: ${scheme.title}. Benefit: ${scheme.amount}. Action: ${scheme.apply}. Portal: ${scheme.link}`;
                     const res = await sendManualAlert(`🏛 Gov Scheme Alert`, msg);
                     setSendingAlert(null);
                     setAlertStatus(prev => ({...prev, [idx]: res.success ? 'success' : 'error'}));
                     setTimeout(() => setAlertStatus(prev => ({...prev, [idx]: null})), 3000);
                   }}
                >
                   {sendingAlert === idx ? (
                     <><span className="spinner-border spinner-border-sm me-2"></span> Sending...</>
                   ) : alertStatus[idx] === 'success' ? (
                     <><i className="bi bi-check-lg me-2"></i> Sent to Phone</>
                   ) : alertStatus[idx] === 'error' ? (
                     <><i className="bi bi-x-circle me-2"></i> Error: Link Phone First</>
                   ) : (
                     <><i className="bi bi-whatsapp me-2"></i> Send to Linked Number</>
                   )}
                </button>

                <a href={scheme.link} target="_blank" rel="noreferrer" className="btn w-100 fw-bold rounded-pill p-2" style={{background: `linear-gradient(135deg, #22c55e, ${NC})`, color: '#09090b', border: 'none', boxShadow: `0 4px 12px ${NCS(0.2)}`}}>
                   Proceed to Official Portal <i className="bi bi-box-arrow-up-right ms-2"></i>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
      )}

    </div>
  );
}

export default GovSchemes;
