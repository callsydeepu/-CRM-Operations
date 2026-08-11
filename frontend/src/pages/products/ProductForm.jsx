import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    category: '',
    unit_price: '',
    current_stock: '',
    minimum_stock: '',
    warehouse_location: ''
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/products/${id}`);
          if (res.data.success) {
            const p = res.data.data;
            setFormData({
              product_name: p.product_name || '',
              sku: p.sku || '',
              category: p.category || '',
              unit_price: p.unit_price !== undefined ? String(p.unit_price) : '',
              current_stock: p.current_stock !== undefined ? String(p.current_stock) : '',
              minimum_stock: p.minimum_stock !== undefined ? String(p.minimum_stock) : '',
              warehouse_location: p.warehouse_location || ''
            });
          }
        } catch (err) {
          console.error('Error loading product:', err);
          setError(err.response?.data?.message || 'Failed to load product');
          addToast('Failed to load product details', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, addToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_name.trim()) {
      addToast('Product name is required', 'warning');
      return;
    }
    if (!formData.sku.trim()) {
      addToast('SKU is required', 'warning');
      return;
    }
    if (!formData.category.trim()) {
      addToast('Category is required', 'warning');
      return;
    }

    const price = parseFloat(formData.unit_price);
    if (isNaN(price) || price < 0) {
      addToast('Unit price must be a valid non-negative number', 'warning');
      return;
    }

    const curStock = parseInt(formData.current_stock, 10);
    if (isNaN(curStock) || curStock < 0) {
      addToast('Current stock must be a non-negative integer', 'warning');
      return;
    }

    const minStock = parseInt(formData.minimum_stock, 10);
    if (isNaN(minStock) || minStock < 0) {
      addToast('Minimum stock must be a non-negative integer', 'warning');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      product_name: formData.product_name.trim(),
      sku: formData.sku.trim(),
      category: formData.category.trim(),
      unit_price: price,
      current_stock: curStock,
      minimum_stock: minStock,
      warehouse_location: formData.warehouse_location.trim() || null
    };

    try {
      if (isEdit) {
        const res = await api.put(`/products/${id}`, payload);
        if (res.data.success) {
          addToast('Product updated successfully', 'success');
          navigate(`/products/${id}`);
        }
      } else {
        const res = await api.post('/products', payload);
        if (res.data.success) {
          addToast('Product created successfully', 'success');
          navigate('/products');
        }
      }
    } catch (err) {
      console.error('Error saving product:', err);
      const msg = err.response?.data?.message || 'Failed to save product';
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
          Loading product details...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="breadcrumb" style={{marginBottom: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>
        <Link to="/products" style={{color: 'var(--primary-container)', textDecoration: 'none'}}>Products</Link> {' > '} {isEdit ? 'Edit Product' : 'Add Product'}
      </div>
      
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      </div>

      {error && (
        <div style={{padding: '0.75rem 1rem', background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', borderRadius: '4px', marginBottom: '1.5rem'}}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header border-bottom">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Product Information</h2>
          </div>
          <div className="card-body" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem'}}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input 
                type="text" 
                className="form-input" 
                name="product_name" 
                value={formData.product_name} 
                onChange={handleChange} 
                placeholder="e.g. Industrial Valve 2-inch"
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">SKU / Item Code *</label>
              <input 
                type="text" 
                className="form-input" 
                name="sku" 
                value={formData.sku} 
                onChange={handleChange} 
                placeholder="e.g. SKU-VLV-005"
                required 
                style={{fontFamily: 'monospace'}}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <input 
                type="text" 
                className="form-input" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                placeholder="e.g. Plumbing, Hardware, Electronics..."
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Selling Price (₹) *</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                className="form-input" 
                name="unit_price" 
                value={formData.unit_price} 
                onChange={handleChange} 
                placeholder="0.00"
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Current Stock *</label>
              <input 
                type="number" 
                min="0"
                className="form-input" 
                name="current_stock" 
                value={formData.current_stock} 
                onChange={handleChange} 
                placeholder="0"
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Minimum Stock Alert Level *</label>
              <input 
                type="number" 
                min="0"
                className="form-input" 
                name="minimum_stock" 
                value={formData.minimum_stock} 
                onChange={handleChange} 
                placeholder="e.g. 10"
                required 
              />
            </div>
            <div className="form-group" style={{gridColumn: '1 / -1'}}>
              <label className="form-label">Warehouse Location (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                name="warehouse_location" 
                value={formData.warehouse_location} 
                onChange={handleChange} 
                placeholder="e.g. Rack B-04, Aisle 3, Bin C-12"
              />
            </div>
          </div>

          <div className="card-body border-top" style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--surface-bright)'}}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
};

export default ProductForm;
