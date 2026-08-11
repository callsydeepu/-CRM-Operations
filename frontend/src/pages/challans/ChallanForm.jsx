import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

const ChallanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { addToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [customerId, setCustomerId] = useState('');
  const [challanNumber, setChallanNumber] = useState('');
  const [items, setItems] = useState([
    { rowId: Date.now(), product_id: '', quantity: 1, unit_price: 0, stock: 0 }
  ]);

  // Load customer and product lists
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers?limit=100'),
          api.get('/products?limit=100')
        ]);
        if (custRes.data.success) setCustomers(custRes.data.data);
        if (prodRes.data.success) setProducts(prodRes.data.data);

        // If edit mode, load existing challan
        if (isEdit) {
          const challanRes = await api.get(`/challans/${id}`);
          if (challanRes.data.success) {
            const ch = challanRes.data.data;
            if (ch.status !== 'Draft') {
              addToast(`Cannot edit challan in '${ch.status}' status.`, 'error');
              navigate(`/challans/${id}`);
              return;
            }
            setCustomerId(String(ch.customer_id));
            setChallanNumber(ch.challan_number);
            if (ch.items && ch.items.length > 0) {
              setItems(ch.items.map((item, idx) => ({
                rowId: Date.now() + idx,
                product_id: String(item.product_id),
                quantity: item.quantity,
                unit_price: item.unit_price_snapshot,
                stock: item.live_current_stock !== undefined ? item.live_current_stock : 0
              })));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load challan form dependencies:', err);
        setError('Failed to load customers or products');
        addToast('Failed to load form data', 'error');
      } finally {
        setLoadingLookups(false);
      }
    };

    loadLookups();
  }, [id, isEdit, navigate, addToast]);

  const handleProductChange = (index, prodId) => {
    const found = products.find(p => p.id === Number(prodId));
    const updated = [...items];
    if (found) {
      updated[index] = {
        ...updated[index],
        product_id: String(found.id),
        unit_price: found.unit_price,
        stock: found.current_stock
      };
    } else {
      updated[index] = {
        ...updated[index],
        product_id: '',
        unit_price: 0,
        stock: 0
      };
    }
    setItems(updated);
  };

  const handleQuantityChange = (index, qty) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, parseInt(qty, 10) || 1);
    setItems(updated);
  };

  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      { rowId: Date.now() + Math.random(), product_id: '', quantity: 1, unit_price: 0, stock: 0 }
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const totalQuantity = items.reduce((sum, i) => sum + (parseInt(i.quantity, 10) || 0), 0);
  const totalAmount = items.reduce((sum, i) => sum + ((parseInt(i.quantity, 10) || 0) * (parseFloat(i.unit_price) || 0)), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId) {
      addToast('Please select a customer', 'warning');
      return;
    }

    const validItems = items.filter(i => i.product_id);
    if (validItems.length === 0) {
      addToast('Please add at least one valid product to the challan', 'warning');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      customer_id: Number(customerId),
      items: validItems.map(i => ({
        product_id: Number(i.product_id),
        quantity: Number(i.quantity)
      }))
    };

    try {
      if (isEdit) {
        const res = await api.put(`/challans/${id}`, payload);
        if (res.data.success) {
          addToast('Draft challan updated successfully', 'success');
          navigate(`/challans/${id}`);
        }
      } else {
        const res = await api.post('/challans', payload);
        if (res.data.success) {
          addToast(`Challan ${res.data.data.challan_number} created as Draft!`, 'success');
          navigate(`/challans/${res.data.data.id}`);
        }
      }
    } catch (err) {
      console.error('Error saving challan:', err);
      const msg = err.response?.data?.message || 'Failed to save challan';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingLookups) {
    return (
      <AppLayout>
        <div style={{padding: '4rem', textAlign: 'center'}}>
          <div className="spinner" style={{margin: '0 auto 1rem', borderColor: 'var(--primary-container)', borderTopColor: 'transparent'}}></div>
          Loading challan workspace...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="breadcrumb" style={{marginBottom: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>
        <Link to="/challans" style={{color: 'var(--primary-container)', textDecoration: 'none'}}>Challans</Link> {' > '} {isEdit ? `Edit ${challanNumber}` : 'Create Delivery Challan'}
      </div>
      
      <div className="page-header">
        <h1 className="page-title">{isEdit ? `Edit Draft Challan (${challanNumber})` : 'Create Sales Challan'}</h1>
        <p className="page-subtitle">Add line items to generate a draft delivery challan</p>
      </div>

      {error && (
        <div style={{padding: '0.75rem 1rem', background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', borderRadius: '4px', marginBottom: '1.5rem'}}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Customer Header Info */}
        <div className="card" style={{marginBottom: '1.5rem'}}>
          <div className="card-header border-bottom">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Customer Information</h2>
          </div>
          <div className="card-body" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem'}}>
            <div className="form-group">
              <label className="form-label">Select Customer *</label>
              <select 
                className="form-select" 
                value={customerId} 
                onChange={(e) => setCustomerId(e.target.value)} 
                required
              >
                <option value="">-- Choose Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.customer_name} {c.business_name ? `(${c.business_name})` : ''} - {c.mobile_number}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="card">
          <div className="card-header border-bottom" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Line Items</h2>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItemRow}>
              <span className="material-symbols-outlined" style={{fontSize: '18px'}}>add</span> Add Item Row
            </button>
          </div>
          
          <div className="table-responsive" style={{overflowX: 'auto'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{width: '40%'}}>Product</th>
                  <th style={{width: '15%'}}>Available Stock</th>
                  <th style={{width: '15%', textAlign: 'right'}}>Quantity</th>
                  <th style={{width: '15%', textAlign: 'right'}}>Unit Price (₹)</th>
                  <th style={{width: '15%', textAlign: 'right'}}>Total (₹)</th>
                  <th style={{width: '5%'}}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const isStockShortage = item.product_id && item.quantity > item.stock;
                  return (
                    <tr key={item.rowId} style={{backgroundColor: isStockShortage ? '#FFF5F5' : 'transparent'}}>
                      <td>
                        <select 
                          className="form-select" 
                          value={item.product_id} 
                          onChange={(e) => handleProductChange(index, e.target.value)} 
                          required
                        >
                          <option value="">-- Select Product --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.product_name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 500,
                          color: item.stock <= 0 ? 'var(--error-red)' : 'var(--on-surface)'
                        }}>
                          {item.product_id ? `${item.stock} units` : '-'}
                        </span>
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <input 
                          type="number" 
                          min="1" 
                          className="form-input" 
                          value={item.quantity} 
                          onChange={(e) => handleQuantityChange(index, e.target.value)} 
                          required 
                          style={{width: '90px', textAlign: 'right', display: 'inline-block'}}
                        />
                        {isStockShortage && (
                          <div style={{color: 'var(--error-red)', fontSize: '11px', fontWeight: 600}}>
                            Exceeds stock ({item.stock})
                          </div>
                        )}
                      </td>
                      <td style={{textAlign: 'right', verticalAlign: 'middle', fontWeight: 500}}>
                        {item.product_id ? `₹${parseFloat(item.unit_price).toFixed(2)}` : '-'}
                      </td>
                      <td style={{textAlign: 'right', verticalAlign: 'middle', fontWeight: 600}}>
                        {item.product_id ? `₹${(item.quantity * item.unit_price).toFixed(2)}` : '-'}
                      </td>
                      <td style={{textAlign: 'center', verticalAlign: 'middle'}}>
                        <button 
                          type="button" 
                          className="btn btn-ghost btn-sm" 
                          onClick={() => removeItemRow(index)} 
                          disabled={items.length === 1} 
                          style={{color: 'var(--error-red)', padding: '4px'}}
                        >
                          <span className="material-symbols-outlined" style={{fontSize: '20px'}}>delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Summary Box */}
          <div className="card-body" style={{display: 'flex', justifyContent: 'flex-end', padding: '1.5rem', background: 'var(--surface-bright)'}}>
            <div style={{width: '320px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-standard)'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Total Quantity</span>
                <span style={{fontWeight: 600, fontSize: '1.1rem'}}>{totalQuantity} units</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontSize: '1.25rem'}}>
                <span style={{fontWeight: 600}}>Grand Total</span>
                <span style={{fontWeight: 700, color: 'var(--primary-container)'}}>
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="card-body border-top" style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--surface-container-lowest)'}}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Draft Challan' : 'Save as Draft Challan'}
            </button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
};

export default ChallanForm;
