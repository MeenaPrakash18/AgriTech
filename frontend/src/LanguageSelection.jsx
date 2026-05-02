import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function LanguageSelection() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const selectLanguage = (lng) => {
    i18n.changeLanguage(lng);
    navigate('/login');
  };

  const languages = [
    { code: 'en', label: 'English', native: 'English', icon: '🇬🇧' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी', icon: '🇮🇳' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', icon: '🇮🇳' },
  ];

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 page-enter"
         style={{background: 'linear-gradient(180deg, #09090b 0%, #18181b 100%)'}}>

      {/* Logo */}
      <div className="mb-4 text-center">
        <img src="/logo.png" alt="AgriTech" className="mb-3 animation-glow" style={{width: '80px', height: '80px', borderRadius: '20px'}} />
        <h1 className="fw-bold mb-2 text-neon-gradient" style={{fontSize: '2rem'}}>AgriTech</h1>
        <p className="text-muted mb-0">Smart Farm Management</p>
      </div>

      <h4 className="fw-bold mb-4 text-center" style={{color: '#39ff14'}}>
        <i className="bi bi-translate me-2"></i>Select Language
      </h4>

      <div className="d-grid gap-3 w-100" style={{maxWidth: '320px'}}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            className="btn btn-lg border-0 d-flex align-items-center justify-content-between px-4 py-3"
            onClick={() => selectLanguage(lang.code)}
            style={{
              background: 'rgba(24, 24, 27, 0.8)',
              border: '1px solid rgba(57, 255, 20, 0.1)',
              borderRadius: '16px',
              color: '#fafafa',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(57, 255, 20, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(57, 255, 20, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(24, 24, 27, 0.8)';
              e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <span style={{fontSize: '1.5rem'}}>{lang.icon}</span>
              <div className="text-start">
                <div className="fw-bold">{lang.native}</div>
                <div className="small" style={{color: '#71717a'}}>{lang.label}</div>
              </div>
            </div>
            <i className="bi bi-chevron-right" style={{color: '#39ff14'}}></i>
          </button>
        ))}
      </div>
    </div>
  );
}

export default LanguageSelection;
