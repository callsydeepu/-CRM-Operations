import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Follow-up modal state
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [followupDate, setFollowupDate] = useState('');
  const [followupNotes, setFollowupNotes] = useState('');
  const [savingFollowup, setSavingFollowup] = useState(false);

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/customers/${id}`);
      if (res.data.success) {
        const c = res.data.data;
        setCustomer(c);
        setFollowupDate(c.follow_up_date ? c.follow_up_date.split('T')[0] : '');
        setFollowupNotes(c.notes || '');
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError(err.response?.data?.message || 'Unable to load customer');
      addToast(err.response?.data?.message || 'Unable to load customer', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleSaveFollowup = async (e) => {
    e.preventDefault();
    setSavingFollowup(true);
    try {
      const res = await api.post(`/customers/${id}/followup`, {
        follow_up_date: followupDate,
        notes: followupNotes
      });
      if (res.data.success) {
        addToast('Follow-up updated successfully', 'success');
        setCustomer(res.data.data);
        setIsFollowupModalOpen(false);
      }
    } catch (err) {
      console.error('Error updating follow-up:', err);
      addToast(err.response?.data?.message || 'Failed to update follow-up', 'error');
    } finally {
      setSavingFollowup(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{padding: '4rem', textAlign: 'center'}}>
          <div className="spinner" style={{margin: '0 auto 1rem', borderColor: 'var(--primary-container)', borderTopColor: 'transparent'}}></div>
          Loading customer profile...
        </div>
      </AppLayout>
    );
  }

  if (error || !customer) {
    return (
      <AppLayout>
        <div className="card" style={{padding: '3rem', textAlign: 'center'}}>
          <p style={{color: 'var(--error-red)', marginBottom: '1rem'}}>{error || 'Customer not found'}</p>
          <button className="btn btn-secondary" onClick={fetchCustomer}>
            <span className="material-symbols-outlined">refresh</span>
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="breadcrumb" style={{marginBottom: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>
        <Link to="/customers" style={{color: 'var(--primary-container)', textDecoration: 'none'}}>Customers</Link> {' > '} {customer.customer_name}
      </div>

      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'}}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{padding: '0.25rem'}}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="page-title" style={{margin: 0}}>{customer.customer_name}</h1>
          <Badge type={customer.status ? customer.status.toLowerCase() : 'lead'}>{customer.status}</Badge>
          <Badge type={customer.customer_type ? customer.customer_type.toLowerCase() : 'retail'}>{customer.customer_type}</Badge>
        </div>
        <div style={{display: 'flex', gap: '0.75rem'}}>
          <button className="btn btn-secondary" onClick={() => setIsFollowupModalOpen(true)}>
            <span className="material-symbols-outlined">edit_calendar</span>
            Update Follow-up
          </button>
          <Link to={`/customers/${id}/edit`} className="btn btn-primary">
            <span className="material-symbols-outlined">edit</span>
            Edit Customer
          </Link>
        </div>
      </div>

      <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap'}}>
        {/* Left Column: Customer Profile */}
        <div className="card" style={{flex: '2', minWidth: '320px'}}>
          <div className="card-header border-bottom">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Customer Information</h2>
          </div>
          <div className="card-body">
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
              <div>
                <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem'}}>Mobile Number</div>
                <div style={{fontWeight: 500, fontSize: '1rem'}}>{customer.mobile_number}</div>
              </div>
              <div>
                <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem'}}>Email Address</div>
                <div style={{fontWeight: 500}}>
                  {customer.email ? (
                    <a href={`mailto:${customer.email}`} style={{color: 'var(--primary-container)', textDecoration: 'none'}}>
                      {customer.email}
                    </a>
                  ) : '-'}
                </div>
              </div>
              <div>
                <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem'}}>Business Name</div>
                <div style={{fontWeight: 500}}>{customer.business_name || '-'}</div>
              </div>
              <div>
                <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem'}}>GST Number</div>
                <div style={{fontWeight: 500}}>{customer.gst_number || '-'}</div>
              </div>
            </div>

            <div style={{marginBottom: '2rem', borderTop: '1px solid var(--border-standard)', paddingTop: '1.5rem'}}>
              <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem'}}>Address</div>
              <div style={{lineHeight: 1.6, color: customer.address ? 'var(--on-surface)' : 'var(--outline)'}}>
                {customer.address || 'No address provided'}
              </div>
            </div>

            <div style={{borderTop: '1px solid var(--border-standard)', paddingTop: '1.5rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase'}}>Notes & History</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setIsFollowupModalOpen(true)} style={{padding: '2px 6px', fontSize: '11px'}}>
                  Edit Notes
                </button>
              </div>
              <div style={{padding: '1rem', background: 'var(--surface-background)', borderRadius: '4px', fontSize: '0.9rem', lineHeight: 1.6, minHeight: '60px'}}>
                {customer.notes || <span style={{color: 'var(--outline)'}}>No notes added yet. Click "Update Follow-up" to record discussion notes.</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: CRM & Activity Summary */}
        <div style={{flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div className="card">
            <div className="card-header border-bottom">
              <h2 className="card-title" style={{fontSize: '1.1rem'}}>Follow-up Status</h2>
            </div>
            <div className="card-body">
              <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem'}}>
                <div style={{padding: '8px', background: 'rgba(255, 183, 93, 0.15)', borderRadius: '4px', color: '#b45309'}}>
                  <span className="material-symbols-outlined" style={{fontSize: '24px'}}>event</span>
                </div>
                <div>
                  <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem'}}>Scheduled Date</div>
                  <div style={{fontWeight: 600, fontSize: '1.1rem', color: customer.follow_up_date ? 'var(--on-surface)' : 'var(--outline)'}}>
                    {customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'No date set'}
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={() => setIsFollowupModalOpen(true)}
                style={{width: '100%', justifyContent: 'center'}}
              >
                <span className="material-symbols-outlined">schedule</span>
                Schedule / Update
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header border-bottom">
              <h2 className="card-title" style={{fontSize: '1.1rem'}}>Record Details</h2>
            </div>
            <div className="card-body" style={{fontSize: '0.85rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Customer ID</span>
                <span style={{fontWeight: 500}}>#{customer.id}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid var(--border-standard)'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Registered On</span>
                <span style={{fontWeight: 500}}>{customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '-'}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid var(--border-standard)'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Last Updated</span>
                <span style={{fontWeight: 500}}>{customer.updated_at ? new Date(customer.updated_at).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up Update Modal */}
      <Modal
        isOpen={isFollowupModalOpen}
        onClose={() => setIsFollowupModalOpen(false)}
        title="Update Follow-up & Notes"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsFollowupModalOpen(false)} disabled={savingFollowup}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveFollowup} disabled={savingFollowup}>
              {savingFollowup ? 'Saving...' : 'Save Follow-up'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveFollowup}>
          <div className="form-group" style={{marginBottom: '1rem'}}>
            <label className="form-label">Follow-up Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={followupDate} 
              onChange={(e) => setFollowupDate(e.target.value)} 
            />
          </div>
          <div className="form-group" style={{marginBottom: 0}}>
            <label className="form-label">Follow-up Notes</label>
            <textarea 
              className="form-textarea" 
              rows="4" 
              value={followupNotes} 
              onChange={(e) => setFollowupNotes(e.target.value)} 
              placeholder="Record discussion outcomes, client requirements, next steps..."
            ></textarea>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default CustomerDetails;
