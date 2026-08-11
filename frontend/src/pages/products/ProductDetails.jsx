import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/common/Badge';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(err.response?.data?.message || 'Unable to load product');
      addToast(err.response?.data?.message || 'Unable to load product', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (loading) {
    return (
      <AppLayout>
        <div style={{padding: '4rem', textAlign: 'center'}}>
          <div className="spinner" style={{margin: '0 auto 1rem', borderColor: 'var(--primary-container)', borderTopColor: 'transparent'}}></div>
          Loading product specifications...
        </div>
      </AppLayout>
    );
  }

  if (error || !product) {
    return (
      <AppLayout>
        <div className="card" style={{padding: '3rem', textAlign: 'center'}}>
          <p style={{color: 'var(--error-red)', marginBottom: '1rem'}}>{error || 'Product not found'}</p>
          <button className="btn btn-secondary" onClick={fetchProduct}>
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
        <Link to="/products" style={{color: 'var(--primary-container)', textDecoration: 'none'}}>Products</Link> {' > '} {product.sku}
      </div>

      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'}}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{padding: '0.25rem'}}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="page-title" style={{margin: 0}}>{product.product_name}</h1>
            <div style={{fontFamily: 'monospace', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>{product.sku}</div>
          </div>
          {product.is_low_stock ? (
            <span className="badge badge-error" style={{display: 'inline-flex', alignItems: 'center', gap: '2px'}}>
              <span className="material-symbols-outlined" style={{fontSize: '14px'}}>warning</span>
              Low Stock Alert
            </span>
          ) : (
            <span className="badge badge-success">
              In Stock
            </span>
          )}
        </div>
        <div style={{display: 'flex', gap: '0.75rem'}}>
          <Link to={`/products/${id}/edit`} className="btn btn-primary">
            <span className="material-symbols-outlined">edit</span>
            Edit Product
          </Link>
        </div>
      </div>

      <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap'}}>
        {/* Left Column: Product Information */}
        <div className="card" style={{flex: '2', minWidth: '320px'}}>
          <div className="card-header border-bottom">
            <h2 className="card-title" style={{fontSize: '1.1rem'}}>Product Specifications</h2>
          </div>
          <div className="card-body">
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
              <div>
                <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem'}}>Category</div>
                <div style={{fontWeight: 500, fontSize: '1rem'}}>{product.category}</div>
              </div>
              <div>
                <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem'}}>Selling Unit Price</div>
                <div style={{fontWeight: 600, fontSize: '1.25rem', color: 'var(--primary-container)'}}>
                  ₹{product.unit_price.toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem'}}>Warehouse Location</div>
                <div style={{fontWeight: 500}}>{product.warehouse_location || 'Not specified'}</div>
              </div>
              <div>
                <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem'}}>Created At</div>
                <div style={{fontWeight: 500}}>
                  {product.created_at ? new Date(product.created_at).toLocaleDateString() : '-'}
                </div>
              </div>
            </div>

            {product.is_low_stock && (
              <div style={{padding: '1rem', background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: '6px', color: '#991B1B', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                <span className="material-symbols-outlined" style={{fontSize: '24px', color: '#B91C1C'}}>warning</span>
                <div>
                  <div style={{fontWeight: 600}}>Low Stock Warning</div>
                  <div style={{fontSize: '0.85rem'}}>Current stock level ({product.current_stock}) is below or equal to the minimum alert threshold ({product.minimum_stock}).</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Inventory & Stock Level */}
        <div style={{flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div className="card">
            <div className="card-header border-bottom">
              <h2 className="card-title" style={{fontSize: '1.1rem'}}>Stock Summary</h2>
            </div>
            <div className="card-body">
              <div style={{textAlign: 'center', padding: '1rem 0 1.5rem'}}>
                <div style={{
                  fontSize: '3rem', 
                  fontWeight: 700, 
                  color: product.is_low_stock ? 'var(--error-red)' : 'var(--success-green)', 
                  lineHeight: 1
                }}>
                  {product.current_stock}
                </div>
                <div style={{color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginTop: '0.5rem'}}>
                  Units on Hand
                </div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-standard)'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Min. Alert Threshold</span>
                <span style={{fontWeight: 600}}>{product.minimum_stock} units</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-standard)'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Inventory Health</span>
                <span style={{fontWeight: 600, color: product.is_low_stock ? 'var(--error-red)' : 'var(--success-green)'}}>
                  {product.is_low_stock ? 'Action Required' : 'Adequate'}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header border-bottom">
              <h2 className="card-title" style={{fontSize: '1.1rem'}}>Record Details</h2>
            </div>
            <div className="card-body" style={{fontSize: '0.85rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Product ID</span>
                <span style={{fontWeight: 500}}>#{product.id}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid var(--border-standard)'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Last Modified</span>
                <span style={{fontWeight: 500}}>{product.updated_at ? new Date(product.updated_at).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProductDetails;
