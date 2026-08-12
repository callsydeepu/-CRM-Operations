import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';

const ChallanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const canManageChallans = user?.role === 'Admin' || user?.role === 'Sales';

  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchChallan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/challans/${id}`);
      if (res.data.success) {
        setChallan(res.data.data);
      }
    } catch (err) {
      console.error('Error loading challan details:', err);
      setError(err.response?.data?.message || 'Unable to load sales challan');
      addToast(err.response?.data?.message || 'Unable to load sales challan', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    fetchChallan();
  }, [fetchChallan]);

  const handleConfirmChallan = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/challans/${id}/confirm`);
      if (res.data.success) {
        addToast(res.data.message || 'Challan confirmed & stock deducted successfully!', 'success');
        setShowConfirmModal(false);
        fetchChallan();
      }
    } catch (err) {
      console.error('Error confirming challan:', err);
      const msg = err.response?.data?.message || 'Failed to confirm challan';
      addToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelChallan = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/challans/${id}/cancel`);
      if (res.data.success) {
        addToast('Challan cancelled successfully', 'info');
        setShowCancelModal(false);
        fetchChallan();
      }
    } catch (err) {
      console.error('Error cancelling challan:', err);
      addToast(err.response?.data?.message || 'Failed to cancel challan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{padding: '4rem', textAlign: 'center'}}>
          <div className="spinner" style={{margin: '0 auto 1rem', borderColor: 'var(--primary-container)', borderTopColor: 'transparent'}}></div>
          Loading sales challan details...
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

  const isDraft = challan.status === 'Draft';
  const isConfirmed = challan.status === 'Confirmed';
  const isCancelled = challan.status === 'Cancelled';

  return (
    <AppLayout>
      <div className="breadcrumb" style={{marginBottom: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>
        <Link to="/challans" style={{color: 'var(--primary-container)', textDecoration: 'none'}}>Sales Challans</Link> {' > '} {challan.challan_number}
      </div>

      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'}}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/challans')} style={{padding: '0.25rem'}}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="page-title" style={{margin: 0, fontFamily: 'monospace'}}>{challan.challan_number}</h1>
            <div style={{fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginTop: '2px'}}>
              Date: {new Date(challan.challan_date || challan.created_at).toLocaleDateString()} • Created by: {challan.created_by_name}
            </div>
          </div>
          <Badge type={challan.status ? challan.status.toLowerCase() : 'draft'}>{challan.status}</Badge>
        </div>

        {canManageChallans && isDraft && (
          <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
            <button className="btn btn-danger" onClick={() => setShowCancelModal(true)} disabled={actionLoading}>
              <span className="material-symbols-outlined" style={{fontSize: '18px'}}>cancel</span>
              Cancel Challan
            </button>
            <Link to={`/challans/${id}/edit`} className="btn btn-secondary">
              <span className="material-symbols-outlined" style={{fontSize: '18px'}}>edit</span>
              Edit Draft
            </Link>
            <button className="btn btn-primary" onClick={() => setShowConfirmModal(true)} disabled={actionLoading} style={{backgroundColor: 'var(--success-green)'}}>
              <span className="material-symbols-outlined" style={{fontSize: '18px'}}>verified</span>
              Confirm & Deduct Stock
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Alerts */}
      {isConfirmed && (
        <div style={{padding: '1rem 1.5rem', background: 'rgba(46, 132, 74, 0.1)', border: '1px solid var(--success-green)', borderRadius: '6px', color: 'var(--success-green)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <span className="material-symbols-outlined" style={{fontSize: '28px'}}>check_circle</span>
          <div>
            <div style={{fontWeight: 600}}>Delivery Challan Confirmed</div>
            <div style={{fontSize: '0.9rem'}}>This order has been officially processed and inventory has been deducted from the warehouse.</div>
          </div>
        </div>
      )}

      {isCancelled && (
        <div style={{padding: '1rem 1.5rem', background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: '6px', color: '#991B1B', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <span className="material-symbols-outlined" style={{fontSize: '28px'}}>block</span>
          <div>
            <div style={{fontWeight: 600}}>Challan Cancelled</div>
            <div style={{fontSize: '0.9rem'}}>This draft delivery was discarded with no impact on current warehouse stock.</div>
          </div>
        </div>
      )}

      <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap'}}>
        {/* Left Column: Line Items Table */}
        <div className="card" style={{flex: '2', minWidth: '340px'}}>
          <div className="card-header border-bottom">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Dispatched Line Items ({challan.items?.length || 0})</h2>
          </div>
          <div className="card-body" style={{padding: 0}}>
            <div className="table-responsive" style={{overflowX: 'auto'}}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item #</th>
                    <th>Product Name</th>
                    <th>SKU (Snapshot)</th>
                    <th style={{textAlign: 'right'}}>Unit Price</th>
                    <th style={{textAlign: 'right'}}>Quantity</th>
                    <th style={{textAlign: 'right'}}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {challan.items?.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td style={{color: 'var(--outline)'}}>{idx + 1}</td>
                      <td>
                        <span style={{fontWeight: 600, color: 'var(--on-surface)'}}>
                          {item.product_name_snapshot}
                        </span>
                      </td>
                      <td>
                        <span style={{fontFamily: 'monospace', color: 'var(--on-surface-variant)'}}>
                          {item.sku_snapshot}
                        </span>
                      </td>
                      <td style={{textAlign: 'right', fontWeight: 500}}>
                        ₹{Number(item.unit_price_snapshot).toFixed(2)}
                      </td>
                      <td style={{textAlign: 'right', fontWeight: 700}}>
                        {item.quantity}
                      </td>
                      <td style={{textAlign: 'right', fontWeight: 600}}>
                        ₹{Number(item.total_price || (item.quantity * item.unit_price_snapshot)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Calculation Footer */}
            <div style={{padding: '1.5rem', background: 'var(--surface-bright)', borderTop: '1px solid var(--border-standard)', display: 'flex', justifyContent: 'flex-end'}}>
              <div style={{width: '280px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--on-surface-variant)'}}>
                  <span>Total Items:</span>
                  <span style={{fontWeight: 600, color: 'var(--on-surface)'}}>{challan.total_items} units</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-container)', borderTop: '1px solid var(--border-standard)', paddingTop: '0.75rem'}}>
                  <span>Total Value:</span>
                  <span>₹{Number(challan.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Delivery Information */}
        <div style={{flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div className="card">
            <div className="card-header border-bottom">
              <h2 className="card-title" style={{fontSize: '1.1rem'}}>Customer Recipient</h2>
            </div>
            <div className="card-body">
              <div style={{fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem'}}>
                {challan.customer_name}
              </div>
              {challan.business_name && (
                <div style={{color: 'var(--outline)', fontSize: '0.9rem', marginBottom: '1rem'}}>
                  {challan.business_name}
                </div>
              )}
              <div style={{fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-standard)', paddingTop: '1rem'}}>
                <div>
                  <span style={{color: 'var(--on-surface-variant)', fontWeight: 600}}>Mobile: </span>
                  {challan.customer_mobile || '-'}
                </div>
                {challan.customer_email && (
                  <div>
                    <span style={{color: 'var(--on-surface-variant)', fontWeight: 600}}>Email: </span>
                    {challan.customer_email}
                  </div>
                )}
                {challan.customer_address && (
                  <div>
                    <span style={{color: 'var(--on-surface-variant)', fontWeight: 600}}>Dispatch Address: </span>
                    <div style={{marginTop: '4px', lineHeight: 1.5, color: 'var(--on-surface)'}}>{challan.customer_address}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header border-bottom">
              <h2 className="card-title" style={{fontSize: '1.1rem'}}>Challan Metadata</h2>
            </div>
            <div className="card-body" style={{fontSize: '0.85rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Status</span>
                <span style={{fontWeight: 600}}>{challan.status}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid var(--border-standard)'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Created On</span>
                <span style={{fontWeight: 500}}>{new Date(challan.created_at).toLocaleString()}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid var(--border-standard)'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Snapshot Retention</span>
                <span style={{fontWeight: 500, color: 'var(--success-green)'}}>Frozen at Creation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {canManageChallans && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Sales Challan"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)} disabled={actionLoading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmChallan} disabled={actionLoading} style={{backgroundColor: 'var(--success-green)'}}>
                {actionLoading ? 'Deducting Stock...' : 'Confirm & Deduct Stock'}
              </button>
            </>
          }
        >
          <div style={{padding: '0.5rem 0'}}>
            <p style={{marginBottom: '1rem', lineHeight: 1.6}}>
              Are you sure you want to confirm sales delivery challan <strong>{challan.challan_number}</strong>?
            </p>
            <div style={{padding: '0.75rem 1rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '4px', color: '#166534', fontSize: '0.9rem'}}>
              ✓ This action will permanently deduct all <strong>{challan.total_items} items</strong> from on-hand warehouse inventory and record matching OUT movements.
            </div>
          </div>
        </Modal>
      )}

      {/* Cancellation Modal */}
      {canManageChallans && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Draft Challan"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)} disabled={actionLoading}>
                Go Back
              </button>
              <button className="btn btn-danger" onClick={handleCancelChallan} disabled={actionLoading}>
                {actionLoading ? 'Cancelling...' : 'Cancel Challan'}
              </button>
            </>
          }
        >
          <div style={{padding: '0.5rem 0'}}>
            <p style={{marginBottom: '1rem', lineHeight: 1.6}}>
              Are you sure you want to cancel draft challan <strong>{challan.challan_number}</strong>?
            </p>
            <div style={{padding: '0.75rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '4px', color: '#991B1B', fontSize: '0.9rem'}}>
              ⚠ The draft will be marked as Cancelled. No warehouse stock will be altered.
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
};

export default ChallanDetails;
