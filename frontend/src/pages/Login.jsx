import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isRegisterMode) {
        await register({ name, email, password, role });
        navigate('/dashboard');
      } else {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card-container">
        {/* Left Side: Visual / Branding */}
        <div className="login-panel-left hidden-mobile">
          <div className="login-brand">
            <div className="login-brand-icon-box">
              <span className="material-symbols-outlined" style={{fontSize: '24px'}}>space_dashboard</span>
            </div>
            <span className="login-brand-title">Mini ERP + CRM</span>
          </div>
          
          <div className="login-hero-text">
            <h1>Streamline your business operations.</h1>
            <p>A unified platform for resource planning and customer relationship management. Secure, scalable, and designed for modern enterprises.</p>
          </div>
          
          <div className="login-footer">
            <span className="material-symbols-outlined" style={{fontSize: '18px', color: 'var(--primary)'}}>verified</span>
            <span>Secure Enterprise Gateway</span>
          </div>
        </div>
        
        {/* Right Side: Login / Register Form */}
        <div className="login-panel-right">
          <div className="login-form-container">
            <div className="login-header">
              <h2>{isRegisterMode ? 'Create Account' : 'Welcome back'}</h2>
              <p>{isRegisterMode ? 'Register your user account to access your workspace.' : 'Please enter your credentials to access your workspace.'}</p>
            </div>
            
            {error && <div className="login-error">{error}</div>}
            
            <form onSubmit={handleSubmit} className="login-form">
              {isRegisterMode && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Full Name</label>
                    <div className="form-input-icon-wrapper">
                      <span className="material-symbols-outlined input-icon">person</span>
                      <input 
                        type="text" 
                        id="name" 
                        className="form-input form-input-with-icon" 
                        placeholder="Enter your full name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="role">Role</label>
                    <select 
                      id="role" 
                      className="form-select" 
                      value={role} 
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="Admin">Admin (Full Access)</option>
                      <option value="Sales">Sales (CRM & Challans)</option>
                      <option value="Warehouse">Warehouse (Inventory & Products)</option>
                      <option value="Accounts">Accounts (View Only)</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <div className="form-input-icon-wrapper">
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input 
                    type="email" 
                    id="email" 
                    className="form-input form-input-with-icon" 
                    placeholder="name@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                  <label className="form-label" htmlFor="password" style={{margin: 0}}>Password</label>
                </div>
                <div className="form-input-icon-wrapper">
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input 
                    type="password" 
                    id="password" 
                    className="form-input form-input-with-icon" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              {!isRegisterMode && (
                <div className="login-options">
                  <label className="checkbox-label">
                    <input type="checkbox" id="remember-me" />
                    <span>Remember me on this device</span>
                  </label>
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                disabled={loading}
              >
                {loading 
                  ? (isRegisterMode ? 'Creating account...' : 'Logging in...') 
                  : (isRegisterMode ? 'Register & Continue' : 'Login to Dashboard')}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setError('');
                  }}
                  style={{ color: 'var(--primary-container)', fontWeight: 600, fontSize: '13px' }}
                >
                  {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
