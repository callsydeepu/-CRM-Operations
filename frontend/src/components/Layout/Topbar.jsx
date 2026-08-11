import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Topbar = ({ onMenuToggle }) => {
  const { user } = useAuth();
  
  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          className="btn btn-ghost" 
          onClick={onMenuToggle}
          style={{ padding: '8px' }}
          title="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="topbar-search">
          <span className="material-symbols-outlined search-icon">search</span>
          <input type="text" placeholder="Quick search..." />
        </div>
      </div>
      
      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'right' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface)' }}>
                {user.name}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--primary-container)', fontWeight: 600 }}>
                {user.role}
              </span>
            </div>
          </div>
        )}
        <div className="topbar-avatar" title={`${user?.name || 'User'} (${user?.role || ''})`}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
