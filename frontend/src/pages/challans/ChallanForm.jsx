import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';

const ChallanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    customerId: isEdit ? '1' : '',
    date: isEdit ? '2023-10-24' : new Date().toISOString().split('T')[0],
    notes: isEdit ? 'Urgent delivery required' : ''
  });

  const [items, setItems] = useState(isEdit ? [
    { id: 1, productId: '1', name: 'Widget A Pro', qty: 10, unit: 'Pcs', price: 1250 },
    { id: 2, productId: '2', name: 'Steel Bearings', qty: 5, unit: 'Box', price: 450 }
  ] : [
    { id: Date.now(), productId: '', name: '', qty: 1, unit: 'Pcs', price: 0 }
  ]);

  // Mock lookups
  const customers = [
    { id: '1', name: 'Sharma Electronics' },
    { id: '2', name: 'Global Trading Co.' },
  ];

  const products = [
    { id: '1', name: 'Widget A Pro', price: 1250, unit: 'Pcs', stock: 145 },
    { id: '2', name: 'Steel Bearings', price: 450, unit: 'Box', stock: 12 },
  ];

  const handleProductChange = (index, productId) => {
    const product = products.find(p => p.id === productId);
    const newItems = [...items];
    if (product) {
      newItems[index] = {
        ...newItems[index],
        productId: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit
      };
    }
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), productId: '', name: '', qty: 1, unit: 'Pcs', price: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);
  };

  const handleSubmit = (e, status) => {
    e.preventDefault();
    console.log(`Saving challan as ${status}:`, { ...formData, items });
    navigate('/challans');
  };

  return (
    <AppLayout>
      <div className="breadcrumb" style={{marginBottom: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>
        <Link to="/challans" style={{color: 'var(--primary-container)', textDecoration: 'none'}}>Challans</Link> {'>'} {isEdit ? 'Edit Challan' : 'Create Challan'}
      </div>
      
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Challan CHL-2023-089' : 'Create New Challan'}</h1>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="card" style={{marginBottom: '1.5rem'}}>
          <div className="card-header border-bottom">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>General Information</h2>
          </div>
          <div className="card-body" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
            <div className="form-group">
              <label className="form-label">Customer *</label>
              <select className="form-select" value={formData.customerId} onChange={(e) => setFormData({...formData, customerId: e.target.value})} required>
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Challan Date *</label>
              <input type="date" className="form-input" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
            </div>
            <div className="form-group" style={{gridColumn: '1 / -1'}}>
              <label className="form-label">Notes / Remarks</label>
              <input type="text" className="form-input" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="e.g. Delivery via Transport Co." />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header border-bottom flex-between" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Items</h2>
            <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>
              <span className="material-symbols-outlined">add</span> Add Item
            </button>
          </div>
          
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{width: '35%'}}>Product</th>
                  <th style={{width: '15%'}}>Qty</th>
                  <th style={{width: '15%'}}>Unit</th>
                  <th style={{width: '15%'}}>Price (₹)</th>
                  <th style={{width: '15%'}}>Total (₹)</th>
                  <th style={{width: '5%'}}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <select className="form-select" value={item.productId} onChange={(e) => handleProductChange(index, e.target.value)} required>
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                      </select>
                    </td>
                    <td>
                      <input type="number" min="1" className="form-input" value={item.qty} onChange={(e) => handleItemChange(index, 'qty', e.target.value)} required />
                    </td>
                    <td>
                      <input type="text" className="form-input" value={item.unit} readOnly style={{backgroundColor: '#f8f9fa'}} />
                    </td>
                    <td>
                      <input type="number" className="form-input" value={item.price} readOnly style={{backgroundColor: '#f8f9fa'}} />
                    </td>
                    <td style={{fontWeight: 600, verticalAlign: 'middle'}}>
                      {(item.qty * item.price).toFixed(2)}
                    </td>
                    <td style={{verticalAlign: 'middle'}}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(index)} disabled={items.length === 1} style={{color: 'var(--error-red)'}}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="card-body" style={{display: 'flex', justifyContent: 'flex-end', padding: '1.5rem'}}>
            <div style={{width: '300px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-standard)'}}>
                <span>Subtotal</span>
                <span style={{fontWeight: 600}}>₹{calculateTotal().toFixed(2)}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '1rem 0', fontSize: '1.2rem'}}>
                <span style={{fontWeight: 600}}>Grand Total</span>
                <span style={{fontWeight: 700, color: 'var(--primary-container)'}}>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="card-body border-top" style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#f8f9fa'}}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="button" className="btn btn-outline" onClick={(e) => handleSubmit(e, 'Draft')} style={{border: '1px solid var(--primary-container)', color: 'var(--primary-container)'}}>Save as Draft</button>
            <button type="button" className="btn btn-primary" onClick={(e) => handleSubmit(e, 'Confirmed')} style={{backgroundColor: 'var(--success-green)'}}>Confirm Challan</button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
};

export default ChallanForm;
