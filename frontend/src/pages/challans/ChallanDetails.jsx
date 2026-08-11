import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

const ChallanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Insufficient Stock Error State Modal / Banner
  const [stockError, setStockError] = useState(null);

  const fetchChallan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/challans/${id}`);
      if (res.data.success) {
        setChallan(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching challan details:', err);
      setError(err.response?.data?.message || 'Unable to load challan');
      addToast(err.response?.data?.message || 'Unable to load challan', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    fetchChallan();
  }, [fetchChallan]);

  const handleConfirmChallan = async () => {
    setConfirming(true);
    setStockError(null);
    try {
      const res = await api.post(`/challans/${id}/confirm`);
      if (res.data.success) {
        addToast('Challan confirmed successfully! Inventory deducted.', 'success');
        setIsConfirmModalOpen(false);
        fetchChallan();
      }
    } catch (err) {
      console.error('Error confirming challan:', err);
      setIsConfirmModalOpen(false);
      const data = err.response?.data;
      if (data && data.message === 'Insufficient stock') {
        setStockError({
          product: data.product,
          available: data.available,
          requested: data.requested
        });
      } else {
        addToast(data?.message || 'Failed to confirm challan', 'error');
      }
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelChallan = async () => {
    if (!window.confirm('Are you sure you want to cancel this draft challan?')) return;
    try {
      const res = await api.post(`/challans/${id}/cancel`);
      if (res.data.success) {
        addToast('Challan cancelled.', 'info');
        fetchChallan();
      }
    } catch (err) {
      console.error('Error cancelling challan:', err);
      addToast(err.response?.data?.message || 'Failed to cancel challan', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed': return <Badge type="confirmed">Confirmed</Badge>;
      case 'Draft': return <Badge type="draft">Draft</Badge>;
      case 'Cancelled': return <Badge type="cancelled">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{padding: '4rem', textAlign: 'center'}}>
          <div className="spinner" style={{margin: '0 auto 1rem', borderColor: 'var(--primary-container)', borderTopColor: 'transparent'}}></div>
          Loading challan details...
        </div>
      </AppLayout>
    );
  }

  if (error || !challan) {
    return (
      <AppLayout>
        <div className="card" style={{padding: '3rem', textAlign: 'center'}}>
          <p style={{color: 'var(--error-red)', marginBottom: '1rem'}}>{error || 'Challan not found'}</p>
          <button className="btn btn-secondary" onClick={fetchChallan}>
            <span className="material-symbols-outlined">refresh</span>
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  const grandTotal = (challan.items || []).reduce((sum, item) => sum + (item.quantity * item.unit_price_snapshot), 0);

  return (
    <AppLayout>
      <div className="breadcrumb" style={{marginBottom: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>
        <Link to="/challans" style={{color: 'var(--primary-container)', textDecoration: 'none'}}>Challans</Link> {' > '} {challan.challan_number}
      </div>

      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'}}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{padding: '0.25rem'}}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="page-title" style={{margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              {challan.challan_number}
              {getStatusBadge(challan.status)}
            </h1>
            <div style={{color: 'var(--on-surface-variant)', marginTop: '0.25rem', fontSize: '0.9rem'}}>
              Created on {new Date(challan.created_at).toLocaleString()} by {challan.created_by_name}
            </div>
          </div>
        </div>
        
        <div style={{display: 'flex', gap: '0.5rem'}}>
          {challan.status === 'Draft' && (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={handleCancelChallan}
                style={{borderColor: 'var(--error-red)', color: 'var(--error-red)'}}
              >
                Cancel Draft
              </button>
              <Link to={`/challans/${challan.id}/edit`} className="btn btn-secondary">
                <span className="material-symbols-outlined" style={{fontSize: '18px'}}>edit</span>
                Edit
              </Link>
              <button 
                className="btn btn-primary" 
                onClick={() => setIsConfirmModalOpen(true)}
                style={{backgroundColor: 'var(--success-green)'}}
              >
                <span className="material-symbols-outlined" style={{fontSize: '18px'}}>check_circle</span>
                Confirm Challan
              </button>
            </>
          )}
        </div>
      </div>

      {/* Insufficient Stock Alert Banner */}
      {stockError && (
        <div style={{
          padding: '1.25rem',
          background: '#FEE2E2',
          border: '1px solid #EF4444',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          color: '#991B1B'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <span className="material-symbols-outlined" style={{fontSize: '28px', color: '#B91C1C'}}>error</span>
              <div>
                <h3 style={{fontWeight: 700, fontSize: '1.05rem', margin: 0}}>Insufficient Inventory for Confirmation</h3>
                <p style={{margin: '0.25rem 0 0', fontSize: '0.9rem'}}>
                  Product <strong>"{stockError.product}"</strong> has only <strong>{stockError.available}</strong> units in stock, but this challan requests <strong>{stockError.requested}</strong> units.
                </p>
              </div>
            </div>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => setStockError(null)} 
              style={{color: '#991B1B'}}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div style={{marginTop: '0.75rem', display: 'flex', gap: '0.75rem'}}>
            <Link to={`/challans/${id}/edit`} className="btn btn-secondary btn-sm" style={{borderColor: '#B91C1C', color: '#B91C1C', backgroundColor: '#FFFFFF'}}>
              Adjust Quantity
            </Link>
            <Link to="/inventory/stock-in" className="btn btn-primary btn-sm" style={{backgroundColor: 'var(--success-green)'}}>
              Receive Stock IN
            </Link>
          </div>
        </div>
      )}

      {/* Customer and Summary Row */}
      <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem'}}>
        <div className="card" style={{flex: '1', minWidth: '300px'}}>
          <div className="card-header border-bottom">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Customer Details</h2>
          </div>
          <div className="card-body">
            <div style={{fontWeight: 600, fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--primary-container)'}}>
              <Link to={`/customers/${challan.customer_id}`} style={{color: 'inherit', textDecoration: 'none'}}>
                {challan.customer_name}
              </Link>
            </div>
            {challan.business_name && (
              <div style={{fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem'}}>
                {challan.business_name} {challan.gst_number ? `(GST: ${challan.gst_number})` : ''}
              </div>
            )}
            <div style={{color: 'var(--on-surface-variant)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.5rem'}}>
              Mobile: {challan.mobile_number} {challan.email ? `| Email: ${challan.email}` : ''}
            </div>
            {challan.address && (
              <div style={{color: 'var(--on-surface-variant)', fontSize: '0.85rem', lineHeight: 1.4}}>
                Address: {challan.address}
              </div>
            )}
          </div>
        </div>
        
        <div className="card" style={{flex: '1', minWidth: '300px'}}>
          <div className="card-header border-bottom">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Dispatch Summary</h2>
          </div>
          <div className="card-body">
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div>
                <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase'}}>Total Items</div>
                <div style={{fontWeight: 600, fontSize: '1.1rem'}}>{(challan.items || []).length} lines</div>
              </div>
              <div>
                <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase'}}>Total Quantity</div>
                <div style={{fontWeight: 600, fontSize: '1.1rem'}}>{challan.total_quantity} units</div>
              </div>
              <div style={{gridColumn: '1 / -1', paddingTop: '0.75rem', borderTop: '1px solid var(--border-standard)'}}>
                <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase'}}>Total Estimated Value</div>
                <div style={{fontWeight: 700, fontSize: '1.4rem', color: 'var(--primary-container)'}}>
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot Items Table */}
      <div className="card">
        <div className="card-header border-bottom">
          <h2 className="card-title" style={{fontSize: '1.1rem'}}>Challan Line Items (Product Snapshots)</h2>
        </div>
        <div className="table-responsive" style={{overflowX: 'auto'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product (Snapshot)</th>
                <th>SKU (Snapshot)</th>
                <th style={{textAlign: 'right'}}>Quantity</th>
                <th style={{textAlign: 'right'}}>Unit Price (Snapshot)</th>
                <th style={{textAlign: 'right'}}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {(challan.items || []).map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td style={{fontWeight: 600}}>
                    {item.product_name_snapshot}
                  </td>
                  <td>
                    <span style={{fontFamily: 'monospace', color: 'var(--on-surface-variant)'}}>{item.sku_snapshot}</span>
                  </td>
                  <td style={{textAlign: 'right', fontWeight: 600}}>{item.quantity}</td>
                  <td style={{textAlign: 'right'}}>₹{item.unit_price_snapshot.toFixed(2)}</td>
                  <td style={{textAlign: 'right', fontWeight: 600}}>₹{(item.quantity * item.unit_price_snapshot).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{backgroundColor: 'var(--surface-bright)', fontWeight: 700}}>
                <td colSpan="3" style={{textAlign: 'right'}}>Grand Total:</td>
                <td style={{textAlign: 'right'}}>{challan.total_quantity} units</td>
                <td></td>
                <td style={{textAlign: 'right', color: 'var(--primary-container)'}}>
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Sales Challan"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsConfirmModalOpen(false)} disabled={confirming}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleConfirmChallan} disabled={confirming} style={{backgroundColor: 'var(--success-green)'}}>
              {confirming ? 'Confirming...' : 'Confirm Challan & Deduct Stock'}
            </button>
          </>
        }
      >
        <div style={{fontSize: '0.95rem', lineHeight: 1.6}}>
          <p style={{marginBottom: '1rem'}}>
            Are you sure you want to confirm challan <strong>{challan.challan_number}</strong>?
          </p>
          <div style={{padding: '1rem', background: 'var(--surface-background)', borderRadius: '4px', marginBottom: '1rem'}}>
            <div><strong>Customer:</strong> {challan.customer_name}</div>
            <div><strong>Total Quantity:</strong> {challan.total_quantity} units</div>
            <div><strong>Total Items:</strong> {(challan.items || []).length} lines</div>
          </div>
          <p style={{color: 'var(--error-red)', fontWeight: 600, fontSize: '0.85rem'}}>
            Notice: Confirming this challan will immediately reduce on-hand warehouse inventory and record stock OUT movements.
          </p>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default ChallanDetails;
