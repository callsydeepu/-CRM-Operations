import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: isEdit ? 'Rahul Sharma' : '',
    email: isEdit ? 'rahul@sharmaelectronics.com' : '',
    phone: isEdit ? '+91 9876543210' : '',
    businessName: isEdit ? 'Sharma Electronics' : '',
    gstNumber: isEdit ? '27AAPCS8732P1Z9' : '',
    type: isEdit ? 'Retail' : 'Retail',
    address: isEdit ? '123 Tech Park' : '',
    city: isEdit ? 'Mumbai' : '',
    state: isEdit ? 'Maharashtra' : '',
    pincode: isEdit ? '400001' : '',
    notes: isEdit ? 'Good client, pays on time.' : ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    console.log('Saving customer:', formData);
    navigate('/customers');
  };

  return (
    <AppLayout>
      <div className="breadcrumb" style={{marginBottom: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>
        <Link to="/customers" style={{color: 'var(--primary-container)', textDecoration: 'none'}}>Customers</Link> {'>'} {isEdit ? 'Edit Customer' : 'Add Customer'}
      </div>
      
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Customer' : 'Add Customer'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header border-bottom">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Contact Information</h2>
          </div>
          <div className="card-body" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input type="tel" className="form-input" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="card-header border-bottom border-top">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Business Details</h2>
          </div>
          <div className="card-body" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input type="text" className="form-input" name="businessName" value={formData.businessName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input type="text" className="form-input" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Type</label>
              <select className="form-select" name="type" value={formData.type} onChange={handleChange}>
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Distributor">Distributor</option>
              </select>
            </div>
          </div>

          <div className="card-header border-bottom border-top">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Address</h2>
          </div>
          <div className="card-body" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
            <div className="form-group" style={{gridColumn: '1 / -1'}}>
              <label className="form-label">Street Address</label>
              <input type="text" className="form-input" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" className="form-input" name="city" value={formData.city} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input type="text" className="form-input" name="state" value={formData.state} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input type="text" className="form-input" name="pincode" value={formData.pincode} onChange={handleChange} />
            </div>
          </div>

          <div className="card-header border-bottom border-top">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Additional Notes</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <textarea className="form-textarea" name="notes" rows="4" value={formData.notes} onChange={handleChange}></textarea>
            </div>
          </div>

          <div className="card-body border-top" style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#f8f9fa'}}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Customer</button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
};

export default CustomerForm;
