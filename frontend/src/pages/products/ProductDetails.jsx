import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/common/Badge';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const product = {
    id: id,
    name: 'Widget A Pro',
    sku: 'WDG-A-001',
    category: 'Electronics',
    unit: 'Pcs',
    price: '₹1,250.00',
    stock: 145,
    minStock: 15,
    status: 'Active',
    description: 'High performance widget for enterprise applications. Features extended durability and premium components.',
    lastRestock: 'Oct 10, 2023',
    createdAt: 'Jan 15, 2023'
  };

  return (
    <AppLayout>
      <div className="breadcrumb" style={{marginBottom: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>
        <Link to="/products" style={{color: 'var(--primary-container)', textDecoration: 'none'}}>Products</Link> {'>'} {product.sku}
      </div>

      <div className="page-header flex-between" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{padding: '0.25rem'}}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="page-title" style={{margin: 0}}>{product.name}</h1>
            <div style={{fontFamily: 'monospace', color: 'var(--on-surface-variant)'}}>{product.sku}</div>
          </div>
          <Badge type={product.status === 'Active' ? 'active' : 'inactive'}>{product.status}</Badge>
        </div>
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <Link to="/inventory/stock-in" className="btn btn-secondary">
            <span className="material-symbols-outlined">add_box</span>
            Stock IN
          </Link>
          <Link to={`/products/${id}/edit`} className="btn btn-outline" style={{border: '1px solid var(--border-standard)'}}>
            <span className="material-symbols-outlined">edit</span>
            Edit
          </Link>
        </div>
      </div>

      <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap'}}>
        <div className="card" style={{flex: '2', minWidth: '300px'}}>
          <div className="card-header border-bottom">
            <h2 className="card-title">Product Details</h2>
          </div>
          <div className="card-body">
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
              <div>
                <div style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem'}}>Category</div>
                <div style={{fontWeight: 500}}>{product.category}</div>
              </div>
              <div>
                <div style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem'}}>Selling Price</div>
                <div style={{fontWeight: 500, color: 'var(--primary-container)'}}>{product.price}</div>
              </div>
              <div>
                <div style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem'}}>Unit of Measure</div>
                <div style={{fontWeight: 500}}>{product.unit}</div>
              </div>
              <div>
                <div style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem'}}>Added On</div>
                <div style={{fontWeight: 500}}>{product.createdAt}</div>
              </div>
            </div>

            <div>
              <div style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem'}}>Description</div>
              <div style={{padding: '1rem', background: 'var(--surface-background)', borderRadius: '4px', fontSize: '0.9rem', lineHeight: 1.6}}>
                {product.description}
              </div>
            </div>
          </div>
        </div>

        <div style={{flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div className="card">
            <div className="card-header border-bottom">
              <h2 className="card-title">Inventory Status</h2>
            </div>
            <div className="card-body">
              <div style={{textAlign: 'center', padding: '1rem 0 2rem'}}>
                <div style={{fontSize: '3rem', fontWeight: 700, color: product.stock > product.minStock ? 'var(--success-green)' : 'var(--warning-amber)', lineHeight: 1}}>
                  {product.stock}
                </div>
                <div style={{color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginTop: '0.5rem'}}>Current Stock ({product.unit})</div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-standard)'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Min. Alert Level</span>
                <span style={{fontWeight: 500}}>{product.minStock} {product.unit}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-standard)'}}>
                <span style={{color: 'var(--on-surface-variant)'}}>Last Restock</span>
                <span style={{fontWeight: 500}}>{product.lastRestock}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProductDetails;
