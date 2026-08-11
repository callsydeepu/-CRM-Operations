import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';

const InventoryList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mock data
  const mockInventory = [
    { id: 1, product: 'Widget A Pro', sku: 'WDG-A-001', stock: 145, minLevel: 15, lastMovement: 'Oct 24, 2023', status: 'In Stock' },
    { id: 2, product: 'Steel Bearings 5mm', sku: 'BRG-S-005', stock: 12, minLevel: 50, lastMovement: 'Oct 23, 2023', status: 'Low Stock' },
    { id: 3, product: 'Copper Wire 2mm', sku: 'WIR-C-002', stock: 8, minLevel: 20, lastMovement: 'Oct 20, 2023', status: 'Low Stock' },
    { id: 4, product: 'Circuit Board v2', sku: 'CRB-V2-001', stock: 0, minLevel: 10, lastMovement: 'Oct 15, 2023', status: 'Out of Stock' },
    { id: 5, product: 'Industrial Motor X', sku: 'MTR-X-099', stock: 45, minLevel: 5, lastMovement: 'Oct 25, 2023', status: 'In Stock' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Stock': return <Badge type="success">{status}</Badge>;
      case 'Low Stock': return <Badge type="warning">{status}</Badge>;
      case 'Out of Stock': return <Badge type="error">{status}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="flex-between" style={{display: 'flex', justifyContent: 'space-between'}}>
          <div>
            <h1 className="page-title">Inventory</h1>
            <p className="page-subtitle">Track and manage your stock levels</p>
          </div>
          <div style={{display: 'flex', gap: '0.75rem'}}>
            <Link to="/inventory/stock-out" className="btn btn-outline" style={{border: '1px solid var(--border-standard)'}}>
              <span className="material-symbols-outlined text-error">remove_circle_outline</span>
              Stock OUT
            </Link>
            <Link to="/inventory/stock-in" className="btn btn-primary">
              <span className="material-symbols-outlined">add_circle_outline</span>
              Stock IN
            </Link>
          </div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem'}}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Products</span>
            <span className="material-symbols-outlined kpi-icon" style={{color: 'var(--primary-container)'}}>inventory_2</span>
          </div>
          <div className="kpi-value">842</div>
        </div>
        <div className="kpi-card" style={{borderTop: '3px solid var(--success-green)'}}>
          <div className="kpi-header">
            <span className="kpi-label">In Stock</span>
            <span className="material-symbols-outlined kpi-icon" style={{color: 'var(--success-green)'}}>check_circle</span>
          </div>
          <div className="kpi-value" style={{color: 'var(--success-green)'}}>790</div>
        </div>
        <div className="kpi-card" style={{borderTop: '3px solid var(--warning-amber)'}}>
          <div className="kpi-header">
            <span className="kpi-label">Low Stock</span>
            <span className="material-symbols-outlined kpi-icon" style={{color: 'var(--warning-amber)'}}>warning</span>
          </div>
          <div className="kpi-value" style={{color: 'var(--warning-amber)'}}>38</div>
        </div>
        <div className="kpi-card" style={{borderTop: '3px solid var(--error-red)'}}>
          <div className="kpi-header">
            <span className="kpi-label">Out of Stock</span>
            <span className="material-symbols-outlined kpi-icon" style={{color: 'var(--error-red)'}}>error</span>
          </div>
          <div className="kpi-value" style={{color: 'var(--error-red)'}}>14</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar" style={{display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'}}>
            <div className="toolbar-search form-input-icon-wrapper" style={{flex: '1', minWidth: '250px', position: 'relative'}}>
              <span className="material-symbols-outlined input-icon" style={{position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)'}}>search</span>
              <input 
                type="text" 
                className="form-input form-input-with-icon" 
                placeholder="Search inventory by product or SKU..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{paddingLeft: '2.5rem', width: '100%'}}
              />
            </div>
            <div className="toolbar-filters">
              <select 
                className="form-select" 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th className="text-right">Current Stock</th>
                <th className="text-right">Min Level</th>
                <th>Status</th>
                <th>Last Movement</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockInventory.map(item => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/products/${item.id}`} style={{fontWeight: 500, color: 'var(--primary-container)', textDecoration: 'none'}}>
                      {item.product}
                    </Link>
                  </td>
                  <td style={{fontFamily: 'monospace', color: 'var(--on-surface-variant)'}}>{item.sku}</td>
                  <td className="text-right" style={{
                    fontWeight: 600, 
                    color: item.stock <= item.minLevel && item.stock > 0 ? 'var(--warning-amber)' : 
                           item.stock === 0 ? 'var(--error-red)' : 'inherit'
                  }}>
                    {item.stock}
                  </td>
                  <td className="text-right text-muted">{item.minLevel}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td style={{color: 'var(--on-surface-variant)'}}>{item.lastMovement}</td>
                  <td className="text-right">
                    <button className="btn btn-ghost btn-sm" title="Options">
                      <span className="material-symbols-outlined">history</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="card-body border-top">
          <Pagination 
            currentPage={currentPage} 
            totalPages={8} 
            onPageChange={setCurrentPage} 
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default InventoryList;
