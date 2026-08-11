import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 30 }} 
          onClick={onClose}
        ></div>
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">M</div>
          <div>
            <div className="sidebar-brand-title">Mini ERP</div>
            <div className="sidebar-brand-subtitle">Operations Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'} end>
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <span className="material-symbols-outlined">group</span>
            Customers
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <span className="material-symbols-outlined">inventory_2</span>
            Products
          </NavLink>
          <NavLink to="/inventory" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <span className="material-symbols-outlined">warehouse</span>
            Inventory
          </NavLink>
          <NavLink to="/challans" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <span className="material-symbols-outlined">receipt_long</span>
            Sales Challans
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="sidebar-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
