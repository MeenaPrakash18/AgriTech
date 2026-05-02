import { useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from './apiConfig';

function Register() {
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    username: '', 
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    const { password } = formData;
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [formData.password]);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.phone.length !== 10) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);
    if (!allCriteriaMet) {
      setError("Please meet all password requirements");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.name,
          phone: formData.phone,
          username: formData.username,
          password: formData.password,
          language: 'en' 
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      
      if (formData.phone) localStorage.setItem('agritech_farmer_phone', formData.phone);
      navigate('/login', { state: { message: "Account created! Please login." } });
    } catch (err) {
      setError(err.message);
    } finally { 
      setLoading(false); 
    }
  };

  const isStrong = Object.values(passwordCriteria).every(Boolean);

  return (
    <div className="d-flex flex-column h-100 justify-content-center px-4 py-5 page-enter" style={{ minHeight: '100svh', background: '#09090b' }}>
      <div className="w-100 mx-auto" style={{ maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <img src="/logo.png" alt="AgriTech" className="mb-3 animation-glow" style={{width: '72px', height: '72px', borderRadius: '18px'}} />
          <h1 className="fw-bold mb-1 text-neon-gradient" style={{fontSize: '2.5rem', letterSpacing: '-1px'}}>AgriTech</h1>
          <p className="text-muted">Empowering farmers with smart technology</p>
        </div>

        <div className="card shadow-lg glass-panel neon-border" style={{ borderTop: '4px solid #39ff14', borderRadius: '20px', overflow: 'hidden' }}>
          <div className="card-body p-4 p-md-5">
            <h3 className="text-center mb-4 text-white fw-bold">Create Account</h3>
            
            {error && (
              <div className="alert alert-danger py-2 px-3 small border-0 mb-4 animate__animated animate__shakeX" style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#fca5a5' }}>
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label small mb-1 text-secondary">Full Name</label>
                <div className="input-group dark-input-group">
                  <span className="input-group-text border-0 bg-transparent text-secondary"><i className="bi bi-person-badge"></i></span>
                  <input type="text" name="name" onChange={handleChange} className="form-control bg-transparent text-white border-0" required placeholder="Rajesh Kumar" />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small mb-1 text-secondary">Phone Number (10 Digits)</label>
                <div className="input-group dark-input-group">
                  <span className="input-group-text border-0 bg-transparent text-secondary"><i className="bi bi-telephone"></i></span>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) handleChange({ target: { name: 'phone', value } });
                    }} 
                    className="form-control bg-transparent text-white border-0" 
                    required 
                    placeholder="9876543210" 
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small mb-1 text-secondary">Username</label>
                <div className="input-group dark-input-group">
                  <span className="input-group-text border-0 bg-transparent text-secondary"><i className="bi bi-person-circle"></i></span>
                  <input type="text" name="username" onChange={handleChange} className="form-control bg-transparent text-white border-0" required placeholder="rajesh_farmer" />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small mb-1 text-secondary">Password</label>
                <div className="input-group dark-input-group">
                  <span className="input-group-text border-0 bg-transparent text-secondary"><i className="bi bi-lock"></i></span>
                  <input type="password" name="password" onChange={handleChange} className="form-control bg-transparent text-white border-0" required placeholder="••••••••" />
                </div>
                
                {/* Password Strength Checklist */}
                <div className="mt-3 p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-bold" style={{ color: isStrong ? '#39ff14' : '#71717a' }}>
                      Strength: {isStrong ? 'Strong' : 'Weak'}
                    </span>
                    <div className="progress w-50" style={{ height: '4px', background: '#27272a' }}>
                      <div 
                        className={`progress-bar ${isStrong ? 'bg-success' : 'bg-warning'}`} 
                        style={{ width: `${(Object.values(passwordCriteria).filter(Boolean).length / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="row g-2">
                    {[
                      { key: 'length', label: '8+ Characters' },
                      { key: 'uppercase', label: 'Uppercase' },
                      { key: 'lowercase', label: 'Lowercase' },
                      { key: 'number', label: 'Number' },
                      { key: 'special', label: 'Special' }
                    ].map(criterion => (
                      <div className="col-6" key={criterion.key}>
                        <div className="d-flex align-items-center small" style={{ color: passwordCriteria[criterion.key] ? '#39ff14' : '#52525b', fontSize: '0.7rem' }}>
                          <i className={`bi ${passwordCriteria[criterion.key] ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}></i>
                          {criterion.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small mb-1 text-secondary">Confirm Password</label>
                <div className="input-group dark-input-group">
                  <span className="input-group-text border-0 bg-transparent text-secondary"><i className="bi bi-shield-lock"></i></span>
                  <input type="password" name="confirmPassword" onChange={handleChange} className="form-control bg-transparent text-white border-0" required placeholder="••••••••" />
                </div>
              </div>

              <button type="submit" className="btn btn-success w-100 py-2 fw-bold shadow-sm mb-3" disabled={loading} style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none' }}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating Account...</> : <>Register Now <i className="bi bi-arrow-right ms-1"></i></>}
              </button>

              <div className="text-center">
                <span className="small text-secondary">Already have an account? </span>
                <Link to="/login" className="text-decoration-none fw-bold small" style={{color: '#39ff14'}}>Login</Link>
              </div>
            </form>
          </div>
        </div>
        
        <p className="text-center mt-4 small text-secondary">
          &copy; {new Date().getFullYear()} AgriTech Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Register;

