import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    customer_name: '',
    mobile_number: '',
    email: '',
    business_name: '',
    gst_number: '',
    customer_type: 'Retail',
    address: '',
    status: 'Lead',
    follow_up_date: '',
    notes: ''
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const fetchCustomer = async () => {
        try {
          const res = await api.get(`/customers/${id}`);
          if (res.data.success) {
            const c = res.data.data;
            setFormData({
              customer_name: c.customer_name || '',
              mobile_number: c.mobile_number || '',
              email: c.email || '',
              business_name: c.business_name || '',
              gst_number: c.gst_number || '',
              customer_type: c.customer_type || 'Retail',
              address: c.address || '',
              status: c.status || 'Lead',
              follow_up_date: c.follow_up_date ? c.follow_up_date.split('T')[0] : '',
              notes: c.notes || ''
            });
          }
        } catch (err) {
          console.error('Error loading customer:', err);
          setError(err.response?.data?.message || 'Failed to load customer');
          addToast('Failed to load customer details', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id, isEdit, addToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name.trim()) {
      addToast('Customer name is required', 'warning');
      return;
    }
    if (!formData.mobile_number.trim()) {
      addToast('Mobile number is required', 'warning');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEdit) {
        const res = await api.put(`/customers/${id}`, formData);
        if (res.data.success) {
          addToast('Customer updated successfully', 'success');
          navigate(`/customers/${id}`);
        }
      } else {
        const res = await api.post('/customers', formData);
        if (res.data.success) {
          addToast('Customer created successfully', 'success');
          navigate('/customers');
        }
      }
    } catch (err) {
      console.error('Error saving customer:', err);
      const msg = err.response?.data?.message || 'Failed to save customer';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{padding: '4rem', textAlign: 'center'}}>
          <div className="spinner" style={{margin: '0 auto 1rem', borderColor: 'var(--primary-container)', borderTopColor: 'transparent'}}></div>
          Loading customer details...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="breadcrumb" style={{marginBottom: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>
        <Link to="/customers" style={{color: 'var(--primary-container)', textDecoration: 'none'}}>Customers</Link> {' > '} {isEdit ? 'Edit Customer' : 'Add Customer'}
      </div>
      
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Customer' : 'Add Customer'}</h1>
      </div>

      {error && (
        <div style={{padding: '0.75rem 1rem', background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', borderRadius: '4px', marginBottom: '1.5rem'}}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header border-bottom">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Contact Information</h2>
          </div>
          <div className="card-body" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input 
                type="text" 
                className="form-input" 
                name="customer_name" 
                value={formData.customer_name} 
                onChange={handleChange} 
                placeholder="Enter customer name"
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input 
                type="tel" 
                className="form-input" 
                name="mobile_number" 
                value={formData.mobile_number} 
                onChange={handleChange} 
                placeholder="e.g. 9876543210"
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="customer@company.com"
              />
            </div>
          </div>
          
          <div className="card-header border-bottom border-top">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Business Details</h2>
          </div>
          <div className="card-body" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input 
                type="text" 
                className="form-input" 
                name="business_name" 
                value={formData.business_name} 
                onChange={handleChange} 
                placeholder="e.g. Acme Industries Ltd"
              />
            </div>
            <div className="form-group">
              <label className="form-label">GST Number (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                name="gst_number" 
                value={formData.gst_number} 
                onChange={handleChange} 
                placeholder="e.g. 27AABCU9603R1ZN"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Type</label>
              <select className="form-select" name="customer_type" value={formData.customer_type} onChange={handleChange}>
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Distributor">Distributor</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="card-header border-bottom border-top">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Address & CRM Details</h2>
          </div>
          <div className="card-body" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
            <div className="form-group" style={{gridColumn: '1 / -1'}}>
              <label className="form-label">Street Address</label>
              <textarea 
                className="form-textarea" 
                name="address" 
                rows="2" 
                value={formData.address} 
                onChange={handleChange}
                placeholder="Enter complete address..."
              ></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Follow-up Date</label>
              <input 
                type="date" 
                className="form-input" 
                name="follow_up_date" 
                value={formData.follow_up_date} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group" style={{gridColumn: '1 / -1'}}>
              <label className="form-label">Notes</label>
              <textarea 
                className="form-textarea" 
                name="notes" 
                rows="3" 
                value={formData.notes} 
                onChange={handleChange} 
                placeholder="Add special instructions, preferences, or discussion notes..."
              ></textarea>
            </div>
          </div>

          <div className="card-body border-top" style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--surface-bright)'}}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
};

export default CustomerForm;
