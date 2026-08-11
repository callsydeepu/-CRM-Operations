import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: isEdit ? 'Widget A Pro' : '',
    sku: isEdit ? 'WDG-A-001' : '',
    category: isEdit ? 'Electronics' : '',
    unit: isEdit ? 'Pcs' : 'Pcs',
    price: isEdit ? '1250.00' : '',
    minStock: isEdit ? '15' : '10',
    description: isEdit ? 'High performance widget for enterprise applications.' : '',
    status: isEdit ? 'Active' : 'Active'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Saving product:', formData);
    navigate('/products');
  };

  return (
    <AppLayout>
      <div className="breadcrumb" style={{marginBottom: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>
        <Link to="/products" style={{color: 'var(--primary-container)', textDecoration: 'none'}}>Products</Link> {'>'} {isEdit ? 'Edit Product' : 'Add Product'}
      </div>
      
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header border-bottom">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Product Information</h2>
          </div>
          <div className="card-body" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input type="text" className="form-input" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">SKU (Stock Keeping Unit) *</label>
              <input type="text" className="form-input" name="sku" value={formData.sku} onChange={handleChange} required style={{fontFamily: 'monospace'}} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" name="category" value={formData.category} onChange={handleChange}>
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Hardware">Hardware</option>
                <option value="Electrical">Electrical</option>
                <option value="Software">Software</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <select className="form-select" name="unit" value={formData.unit} onChange={handleChange}>
                <option value="Pcs">Pieces (Pcs)</option>
                <option value="Box">Box</option>
                <option value="Kg">Kilograms (Kg)</option>
                <option value="Meter">Meters</option>
                <option value="Liter">Liters</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Selling Price (₹) *</label>
              <input type="number" step="0.01" className="form-input" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Minimum Stock Alert Level</label>
              <input type="number" className="form-input" name="minStock" value={formData.minStock} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-group" style={{gridColumn: '1 / -1'}}>
              <label className="form-label">Product Description</label>
              <textarea className="form-textarea" name="description" rows="4" value={formData.description} onChange={handleChange}></textarea>
            </div>
          </div>

          <div className="card-body border-top" style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#f8f9fa'}}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Product</button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
};

export default ProductForm;
