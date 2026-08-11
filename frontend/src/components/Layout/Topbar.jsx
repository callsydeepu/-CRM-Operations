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
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="topbar-search">
          <span className="material-symbols-outlined search-icon">search</span>
          <input type="text" placeholder="Search..." />
        </div>
      </div>
      
      <div className="topbar-actions">
        <button className="topbar-notification">
          <span className="material-symbols-outlined">notifications</span>
          <span className="badge"></span>
        </button>
        <div className="topbar-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
