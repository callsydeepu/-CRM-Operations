import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

const StockMovement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isStockIn = location.pathname.includes('stock-in');
  
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    reason: isStockIn ? 'New Purchase Delivery' : 'Sales Dispatch',
    notes: ''
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get('/products?limit=100');
        if (res.data.success) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
        addToast('Failed to load products list', 'error');
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, [addToast]);

  const selectedProduct = products.find(p => p.id === Number(formData.productId));
  const qtyNumber = parseInt(formData.quantity, 10) || 0;
  const isOverStock = !isStockIn && selectedProduct && qtyNumber > selectedProduct.current_stock;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId) {
      addToast('Please select a product', 'warning');
      return;
    }
    if (qtyNumber <= 0) {
      addToast('Quantity must be greater than 0', 'warning');
      return;
    }

    if (isOverStock) {
      addToast(`Cannot remove ${qtyNumber} units. Only ${selectedProduct.current_stock} units available.`, 'error');
      return;
    }

    setSubmitting(true);
    setError(null);

    const endpoint = isStockIn ? '/inventory/stock-in' : '/inventory/stock-out';
    const reasonText = formData.notes.trim() 
      ? `${formData.reason} - ${formData.notes.trim()}`
      : formData.reason;

    try {
      const res = await api.post(endpoint, {
        product_id: Number(formData.productId),
        quantity: qtyNumber,
        reason: reasonText
      });

      if (res.data.success) {
        addToast(`Stock ${isStockIn ? 'IN' : 'OUT'} recorded successfully!`, 'success');
        navigate('/inventory');
      }
    } catch (err) {
      console.error('Stock adjustment error:', err);
      const msg = err.response?.data?.message || 'Failed to process stock adjustment';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="breadcrumb" style={{marginBottom: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>
        <Link to="/inventory" style={{color: 'var(--primary-container)', textDecoration: 'none'}}>Inventory</Link> {' > '} {isStockIn ? 'Stock IN' : 'Stock OUT'}
      </div>
      
      <div className="page-header">
        <h1 className="page-title" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <span className="material-symbols-outlined" style={{color: isStockIn ? 'var(--success-green)' : 'var(--error-red)'}}>
            {isStockIn ? 'add_circle' : 'remove_circle'}
          </span>
          {isStockIn ? 'Stock IN (Receive Inventory)' : 'Stock OUT (Issue Inventory)'}
        </h1>
        <p className="page-subtitle">
          {isStockIn ? 'Increase on-hand stock and record procurement / returns' : 'Deduct stock for orders, samples, or adjustments'}
        </p>
      </div>

      {error && (
        <div style={{padding: '0.75rem 1rem', background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', borderRadius: '4px', marginBottom: '1.5rem'}}>
          {error}
        </div>
      )}

      <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start'}}>
        <form onSubmit={handleSubmit} style={{flex: '2', minWidth: '320px'}}>
          <div className="card">
            <div className="card-header border-bottom">
              <h2 className="card-title" style={{fontSize: '1.1rem'}}>Movement Details</h2>
            </div>
            <div className="card-body" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              <div className="form-group">
                <label className="form-label">Select Product *</label>
                <select 
                  className="form-select" 
                  name="productId" 
                  value={formData.productId} 
                  onChange={handleChange} 
                  required
                  disabled={loadingProducts}
                >
                  <option value="">-- Choose a product from catalog --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.product_name} ({p.sku}) — Available: {p.current_stock}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem'}}>
                <div className="form-group">
                  <label className="form-label">Quantity to {isStockIn ? 'Add' : 'Deduct'} *</label>
                  <input 
                    type="number" 
                    min="1" 
                    className="form-input" 
                    name="quantity" 
                    value={formData.quantity} 
                    onChange={handleChange} 
                    placeholder="Enter units quantity"
                    required 
                  />
                  {isOverStock && (
                    <div style={{color: 'var(--error-red)', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 600}}>
                      Insufficient stock! Available: {selectedProduct.current_stock}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Movement Reason *</label>
                  <select className="form-select" name="reason" value={formData.reason} onChange={handleChange} required>
                    {isStockIn ? (
                      <>
                        <option value="New Purchase Delivery">New Purchase Delivery</option>
                        <option value="Customer Return">Customer Return</option>
                        <option value="Inventory Audit In">Inventory Audit / Adjustment</option>
                        <option value="Production Restock">Production Restock</option>
                      </>
                    ) : (
                      <>
                        <option value="Sales Dispatch">Sales Dispatch</option>
                        <option value="Damaged / Scrap">Damaged / Scrap</option>
                        <option value="Internal Testing / Sample">Internal Testing / Sample</option>
                        <option value="Inventory Audit Out">Inventory Audit / Adjustment</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes / Reference</label>
                <textarea 
                  className="form-textarea" 
                  name="notes" 
                  rows="3" 
                  value={formData.notes} 
                  onChange={handleChange} 
                  placeholder="e.g. Supplier PO #123, Inspection passed, Batch #4..."
                ></textarea>
              </div>
            </div>

            <div className="card-body border-top" style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--surface-bright)'}}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={submitting}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{backgroundColor: isStockIn ? 'var(--success-green)' : 'var(--primary-container)'}}
                disabled={submitting || isOverStock || !formData.productId || qtyNumber <= 0}
              >
                {submitting ? 'Processing...' : `Confirm Stock ${isStockIn ? 'IN' : 'OUT'}`}
              </button>
            </div>
          </div>
        </form>

        {/* Live Impact Summary Card */}
        {selectedProduct && (
          <div className="card" style={{flex: '1', minWidth: '280px'}}>
            <div className="card-header border-bottom">
              <h2 className="card-title" style={{fontSize: '1.1rem'}}>Balance Preview</h2>
            </div>
            <div className="card-body">
              <div style={{marginBottom: '1.25rem'}}>
                <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase'}}>Selected Product</div>
                <div style={{fontWeight: 600, fontSize: '1.1rem', color: 'var(--on-surface)', marginTop: '2px'}}>{selectedProduct.product_name}</div>
                <div style={{fontFamily: 'monospace', color: 'var(--outline)', fontSize: '0.85rem'}}>{selectedProduct.sku}</div>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-standard)'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Current Stock</span>
                <span style={{fontWeight: 600, fontSize: '1.1rem'}}>{selectedProduct.current_stock}</span>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-standard)'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Adjustment</span>
                <span style={{fontWeight: 600, fontSize: '1.1rem', color: isStockIn ? 'var(--success-green)' : 'var(--error-red)'}}>
                  {qtyNumber ? (isStockIn ? `+${qtyNumber}` : `-${qtyNumber}`) : '0'}
                </span>
              </div>

              <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                borderTop: '1px solid var(--border-standard)', 
                backgroundColor: isOverStock ? '#FEE2E2' : 'var(--surface-background)', 
                margin: '0 -1.25rem', 
                padding: '1rem 1.25rem'
              }}>
                <span style={{fontWeight: 600}}>Projected Stock</span>
                <span style={{fontWeight: 700, fontSize: '1.25rem', color: isOverStock ? 'var(--error-red)' : 'var(--on-surface)'}}>
                  {isStockIn ? selectedProduct.current_stock + qtyNumber : selectedProduct.current_stock - qtyNumber}
                </span>
              </div>

              {isOverStock && (
                <div style={{padding: '0.75rem', background: '#FEE2E2', borderRadius: '4px', color: '#991B1B', marginTop: '1rem', fontSize: '0.85rem'}}>
                  <strong>Error:</strong> Cannot deduct more units than currently in stock.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StockMovement;
