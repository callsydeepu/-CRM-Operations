import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';

const ProductList = () => {
  const { user } = useAuth();
  const canManageProducts = user?.role === 'Admin' || user?.role === 'Warehouse';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const { addToast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (categoryFilter) params.category = categoryFilter;
      if (lowStockOnly) params.lowStock = 'true';

      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.data);
        setPagination(prev => ({
          ...prev,
          total: res.data.pagination.total,
          totalPages: res.data.pagination.totalPages
        }));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Unable to load products');
      addToast(err.response?.data?.message || 'Unable to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, categoryFilter, lowStockOnly, addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLowStockToggle = () => {
    setLowStockOnly(prev => !prev);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
          <div>
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">Manage your product catalog and inventory levels</p>
          </div>
          {canManageProducts && (
            <Link to="/products/new" className="btn btn-primary">
              <span className="material-symbols-outlined">add</span>
              Add Product
            </Link>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{padding: '1rem'}}>
          <div className="toolbar" style={{display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', width: '100%', padding: 0, background: 'transparent'}}>
            <div className="toolbar-search" style={{flex: '1', minWidth: '240px', position: 'relative'}}>
              <span className="material-symbols-outlined search-icon" style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)'}}>search</span>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search by product name, SKU, or category..." 
                value={searchTerm}
                onChange={handleSearchChange}
                style={{paddingLeft: '2.5rem', width: '100%'}}
              />
            </div>
            <div className="toolbar-filters" style={{display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
              <select 
                className="form-select" 
                value={categoryFilter}
                onChange={handleCategoryChange}
              >
                <option value="">All Categories</option>
                <option value="Widgets">Widgets</option>
                <option value="Machinery">Machinery</option>
                <option value="Hardware">Hardware</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electronics">Electronics</option>
                <option value="Electrical">Electrical</option>
                <option value="Tools">Tools</option>
              </select>

              <button 
                type="button"
                onClick={handleLowStockToggle}
                className={`btn ${lowStockOnly ? 'btn-danger' : 'btn-secondary'}`}
                style={{whiteSpace: 'nowrap'}}
              >
                <span className="material-symbols-outlined" style={{fontSize: '18px'}}>warning</span>
                {lowStockOnly ? 'Showing Low Stock' : 'Low Stock Only'}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)'}}>
            <div className="spinner" style={{margin: '0 auto 1rem', borderColor: 'var(--primary-container)', borderTopColor: 'transparent'}}></div>
            Loading products...
          </div>
        ) : error ? (
          <div style={{padding: '3rem', textAlign: 'center'}}>
            <p style={{color: 'var(--error-red)', marginBottom: '1rem'}}>{error}</p>
            <button className="btn btn-secondary" onClick={fetchProducts}>
              <span className="material-symbols-outlined">refresh</span>
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div style={{padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)'}}>
            <span className="material-symbols-outlined" style={{fontSize: '48px', color: 'var(--outline)', marginBottom: '0.5rem'}}>inventory_2</span>
            <p style={{fontSize: '1.1rem', fontWeight: 500, color: 'var(--on-surface)', marginBottom: '0.5rem'}}>No products found</p>
            <p style={{fontSize: '0.9rem', marginBottom: '1.5rem'}}>
              {searchTerm || categoryFilter || lowStockOnly ? 'Try adjusting your search or filters' : (canManageProducts ? 'Get started by creating your first product.' : 'No products available.')}
            </p>
            {searchTerm || categoryFilter || lowStockOnly ? (
              <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setCategoryFilter(''); setLowStockOnly(false); }}>
                Clear Filters
              </button>
            ) : canManageProducts ? (
              <Link to="/products/new" className="btn btn-primary">
                <span className="material-symbols-outlined">add</span>
                Add Product
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            <div className="table-responsive" style={{overflowX: 'auto'}}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th style={{textAlign: 'right'}}>Unit Price</th>
                    <th style={{textAlign: 'right'}}>Stock</th>
                    <th>Status</th>
                    <th style={{textAlign: 'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <Link to={`/products/${product.id}`} style={{fontWeight: 600, color: 'var(--primary-container)', textDecoration: 'none'}}>
                          {product.product_name}
                        </Link>
                      </td>
                      <td>
                        <span style={{fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--on-surface-variant)'}}>{product.sku}</span>
                      </td>
                      <td>{product.category}</td>
                      <td style={{color: product.warehouse_location ? 'inherit' : 'var(--outline)'}}>{product.warehouse_location || '-'}</td>
                      <td style={{textAlign: 'right', fontWeight: 500}}>
                        ₹{product.unit_price.toFixed(2)}
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <span style={{
                          fontWeight: 600,
                          color: product.is_low_stock ? 'var(--error-red)' : 'var(--on-surface)'
                        }}>
                          {product.current_stock}
                        </span>
                        <span style={{fontSize: '0.75rem', color: 'var(--outline)', marginLeft: '4px'}}>
                          / {product.minimum_stock} min
                        </span>
                      </td>
                      <td>
                        {product.is_low_stock ? (
                          <span className="badge badge-error" style={{display: 'inline-flex', alignItems: 'center', gap: '2px'}}>
                            <span className="material-symbols-outlined" style={{fontSize: '12px'}}>warning</span>
                            Low Stock
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <div style={{display: 'inline-flex', gap: '0.25rem'}}>
                          <Link to={`/products/${product.id}`} className="btn btn-ghost btn-sm" title="View Details" style={{padding: '4px 8px'}}>
                            <span className="material-symbols-outlined" style={{fontSize: '18px'}}>visibility</span>
                          </Link>
                          {canManageProducts && (
                            <Link to={`/products/${product.id}/edit`} className="btn btn-ghost btn-sm" title="Edit Product" style={{padding: '4px 8px'}}>
                              <span className="material-symbols-outlined" style={{fontSize: '18px'}}>edit</span>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="card-body border-top" style={{padding: 0}}>
              <Pagination 
                currentPage={pagination.page} 
                totalPages={pagination.totalPages} 
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange} 
              />
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default ProductList;
