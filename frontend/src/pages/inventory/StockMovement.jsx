import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';

const StockMovement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isStockIn = location.pathname.includes('stock-in');
  
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    reason: '',
    reference: '',
    notes: ''
  });

  // Mock product selection
  const products = [
    { id: 1, name: 'Widget A Pro', sku: 'WDG-A-001', stock: 145 },
    { id: 2, name: 'Steel Bearings 5mm', sku: 'BRG-S-005', stock: 12 },
    { id: 3, name: 'Copper Wire 2mm', sku: 'WIR-C-002', stock: 8 },
  ];

  const selectedProduct = products.find(p => p.id === Number(formData.productId));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Processing Stock ${isStockIn ? 'IN' : 'OUT'}:`, formData);
    navigate('/inventory');
  };

  return (
    <AppLayout>
      <div className="breadcrumb" style={{marginBottom: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>
        <Link to="/inventory" style={{color: 'var(--primary-container)', textDecoration: 'none'}}>Inventory</Link> {'>'} {isStockIn ? 'Stock IN' : 'Stock OUT'}
      </div>
      
      <div className="page-header">
        <h1 className="page-title" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <span className="material-symbols-outlined" style={{color: isStockIn ? 'var(--success-green)' : 'var(--error-red)'}}>
            {isStockIn ? 'add_circle' : 'remove_circle'}
          </span>
          {isStockIn ? 'Stock IN (Add Inventory)' : 'Stock OUT (Remove Inventory)'}
        </h1>
        <p className="page-subtitle">
          {isStockIn ? 'Record new stock arrivals and returns' : 'Record stock usage, damages, or adjustments'}
        </p>
      </div>

      <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start'}}>
        <form onSubmit={handleSubmit} style={{flex: '2', minWidth: '300px'}}>
          <div className="card">
            <div className="card-header border-bottom">
              <h2 className="card-title">Movement Details</h2>
            </div>
            <div className="card-body" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              <div className="form-group">
                <label className="form-label">Select Product *</label>
                <select className="form-select" name="productId" value={formData.productId} onChange={handleChange} required>
                  <option value="">-- Search and select a product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem'}}>
                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input 
                    type="number" 
                    min="1" 
                    className="form-input" 
                    name="quantity" 
                    value={formData.quantity} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reason *</label>
                  <select className="form-select" name="reason" value={formData.reason} onChange={handleChange} required>
                    <option value="">Select Reason</option>
                    {isStockIn ? (
                      <>
                        <option value="purchase">New Purchase</option>
                        <option value="return">Customer Return</option>
                        <option value="adjustment">Inventory Adjustment</option>
                      </>
                    ) : (
                      <>
                        <option value="sale">Manual Sale</option>
                        <option value="damage">Damaged/Spoiled</option>
                        <option value="internal">Internal Usage</option>
                        <option value="adjustment">Inventory Adjustment</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reference / PO Number</label>
                <input type="text" className="form-input" name="reference" value={formData.reference} onChange={handleChange} placeholder="e.g. PO-2023-089" />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" name="notes" rows="3" value={formData.notes} onChange={handleChange} placeholder="Additional details about this movement..."></textarea>
              </div>
            </div>

            <div className="card-body border-top" style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#f8f9fa'}}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{backgroundColor: isStockIn ? 'var(--success-green)' : 'var(--primary-container)'}}>
                Confirm Stock {isStockIn ? 'IN' : 'OUT'}
              </button>
            </div>
          </div>
        </form>

        {selectedProduct && (
          <div className="card" style={{flex: '1', minWidth: '250px'}}>
            <div className="card-header border-bottom">
              <h2 className="card-title">Impact Summary</h2>
            </div>
            <div className="card-body">
              <div style={{marginBottom: '1rem'}}>
                <div style={{fontSize: '0.9rem', color: 'var(--on-surface-variant)'}}>Selected Product</div>
                <div style={{fontWeight: 600, fontSize: '1.1rem'}}>{selectedProduct.name}</div>
                <div style={{fontFamily: 'monospace', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>{selectedProduct.sku}</div>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderTop: '1px solid var(--border-standard)'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Current Stock</span>
                <span style={{fontWeight: 600, fontSize: '1.1rem'}}>{selectedProduct.stock}</span>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderTop: '1px solid var(--border-standard)'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Adjustment</span>
                <span style={{fontWeight: 600, fontSize: '1.1rem', color: isStockIn ? 'var(--success-green)' : 'var(--error-red)'}}>
                  {formData.quantity ? (isStockIn ? `+${formData.quantity}` : `-${formData.quantity}`) : '0'}
                </span>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-standard)', backgroundColor: 'var(--surface-background)', margin: '0 -1.5rem', padding: '1rem 1.5rem'}}>
                <span style={{fontWeight: 600}}>New Balance</span>
                <span style={{fontWeight: 700, fontSize: '1.2rem'}}>
                  {formData.quantity ? 
                    (isStockIn ? selectedProduct.stock + Number(formData.quantity) : selectedProduct.stock - Number(formData.quantity)) 
                    : selectedProduct.stock}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StockMovement;
