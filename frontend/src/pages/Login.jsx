import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // mock useAuth context
  const auth = useAuth() || {
    login: async () => true,
    error: null,
  };
  const { login } = auth;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-split">
        <div className="login-panel-left hidden-mobile">
          <div className="login-brand">
            <span className="material-symbols-outlined logo-icon">storefront</span>
            <h1>Mini ERP + CRM</h1>
          </div>
          <div className="login-hero-text">
            <h2>Streamline your business operations</h2>
            <p>Manage your customers, inventory, and sales in one seamless platform designed for growing enterprises.</p>
          </div>
          <div className="login-footer">
            <span className="material-symbols-outlined">verified_user</span>
            <span>Secure Enterprise Gateway</span>
          </div>
        </div>
        
        <div className="login-panel-right">
          <div className="login-form-container">
            <div className="login-header">
              <h2>Welcome back</h2>
              <p>Please enter your details to access your dashboard.</p>
            </div>
            
            {error && <div className="login-error">{error}</div>}
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <div className="form-input-icon-wrapper">
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input 
                    type="email" 
                    id="email" 
                    className="form-input form-input-with-icon" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
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
              
              <div className="login-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login to Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
