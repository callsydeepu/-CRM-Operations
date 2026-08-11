import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const getRoleColor = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return '#2563EB'; // Blue
    case 'sales':
      return '#22C55E'; // Green
    case 'warehouse':
      return '#F97316'; // Orange
    case 'accounts':
      return '#A855F7'; // Purple
    default:
      return '#64748B'; // Gray
  }
};

const Protected = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="protected-container">
      <div className="dashboard-card">
        <h1 className="welcome-text">Welcome, {user?.name || 'User'}</h1>
        
        <div className="user-info">
          <div className="info-group">
            <span className="info-label">Role</span>
            <span 
              className="role-badge" 
              style={{ backgroundColor: getRoleColor(user?.role) }}
            >
              {user?.role || 'User'}
            </span>
          </div>
          
          <div className="info-group">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email || 'N/A'}</span>
          </div>
        </div>

        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Protected;
