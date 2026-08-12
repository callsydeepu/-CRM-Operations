import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';

const InventoryList = () => {
  const { user } = useAuth();
  const canAdjustStock = user?.role === 'Admin' || user?.role === 'Warehouse';

  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'movements'
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const { addToast } = useToast();

  const fetchInventoryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'stock') {
        const params = {
          page: pagination.page,
          limit: pagination.limit
        };
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (statusFilter === 'Low Stock') params.lowStock = 'true';

        const res = await api.get('/products', { params });
        if (res.data.success) {
          setProducts(res.data.data);
          setPagination(prev => ({
            ...prev,
            total: res.data.pagination.total,
            totalPages: res.data.pagination.totalPages
          }));
        }
      } else {
        const params = {
          page: pagination.page,
          limit: pagination.limit
        };
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (movementTypeFilter) params.movement_type = movementTypeFilter;

        const res = await api.get('/inventory/movements', { params });
        if (res.data.success) {
          setMovements(res.data.data);
          setPagination(prev => ({
            ...prev,
            total: res.data.pagination.total,
            totalPages: res.data.pagination.totalPages
          }));
        }
      }
    } catch (err) {
      console.error('Error loading inventory data:', err);
      setError(err.response?.data?.message || 'Unable to load inventory data');
      addToast(err.response?.data?.message || 'Unable to load inventory data', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.page, pagination.limit, searchTerm, statusFilter, movementTypeFilter, addToast]);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setStatusFilter('');
    setMovementTypeFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Quick KPI calculation
  const totalItemsCount = pagination.total;
  const lowStockCount = products.filter(p => p.is_low_stock || p.current_stock <= p.minimum_stock).length;
  const outOfStockCount = products.filter(p => p.current_stock === 0).length;

  return (
    <AppLayout>
      <div className="page-header">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem'}}>
          <div>
            <h1 className="page-title">Inventory Management</h1>
            <p className="page-subtitle">Track stock levels, record movements, and review history</p>
          </div>
          {canAdjustStock && (
            <div style={{display: 'flex', gap: '0.75rem'}}>
              <Link to="/inventory/stock-out" className="btn btn-secondary" style={{borderColor: 'var(--error-red)', color: 'var(--error-red)'}}>
                <span className="material-symbols-outlined" style={{fontSize: '18px'}}>remove_circle</span>
                Stock OUT
              </Link>
              <Link to="/inventory/stock-in" className="btn btn-primary" style={{backgroundColor: 'var(--success-green)'}}>
                <span className="material-symbols-outlined" style={{fontSize: '18px'}}>add_circle</span>
                Stock IN
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem'}}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Catalog Products</span>
            <span className="material-symbols-outlined" style={{color: 'var(--primary-container)'}}>inventory_2</span>
          </div>
          <div className="kpi-value">{totalItemsCount}</div>
        </div>
        <div className="kpi-card" style={{borderTop: '3px solid var(--success-green)'}}>
          <div className="kpi-header">
            <span className="kpi-label">Adequate Stock</span>
            <span className="material-symbols-outlined" style={{color: 'var(--success-green)'}}>check_circle</span>
          </div>
          <div className="kpi-value" style={{color: 'var(--success-green)'}}>
            {Math.max(0, totalItemsCount - lowStockCount)}
          </div>
        </div>
        <div className="kpi-card" style={{borderTop: '3px solid var(--warning-amber)'}}>
          <div className="kpi-header">
            <span className="kpi-label">Low Stock Alerts</span>
            <span className="material-symbols-outlined" style={{color: 'var(--warning-amber)'}}>warning</span>
          </div>
          <div className="kpi-value" style={{color: 'var(--warning-amber)'}}>{lowStockCount}</div>
        </div>
        <div className="kpi-card" style={{borderTop: '3px solid var(--error-red)'}}>
          <div className="kpi-header">
            <span className="kpi-label">Out of Stock</span>
            <span className="material-symbols-outlined" style={{color: 'var(--error-red)'}}>error</span>
          </div>
          <div className="kpi-value" style={{color: 'var(--error-red)'}}>{outOfStockCount}</div>
        </div>
      </div>

      {/* Main Card with Tabs */}
      <div className="card">
        {/* Navigation Tabs */}
        <div style={{display: 'flex', borderBottom: '1px solid var(--border-standard)', background: 'var(--surface-bright)', padding: '0 1rem'}}>
          <button
            onClick={() => handleTabSwitch('stock')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              color: activeTab === 'stock' ? 'var(--primary-container)' : 'var(--on-surface-variant)',
              borderBottom: activeTab === 'stock' ? '2px solid var(--primary-container)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span className="material-symbols-outlined" style={{fontSize: '18px'}}>warehouse</span>
            Stock Levels
          </button>
          <button
            onClick={() => handleTabSwitch('movements')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              color: activeTab === 'movements' ? 'var(--primary-container)' : 'var(--on-surface-variant)',
              borderBottom: activeTab === 'movements' ? '2px solid var(--primary-container)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span className="material-symbols-outlined" style={{fontSize: '18px'}}>history</span>
            Stock Movement Log
          </button>
        </div>

        {/* Toolbar */}
        <div className="card-header" style={{padding: '1rem'}}>
          <div className="toolbar" style={{display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', width: '100%', padding: 0, background: 'transparent'}}>
            <div className="toolbar-search" style={{flex: '1', minWidth: '240px', position: 'relative'}}>
              <span className="material-symbols-outlined search-icon" style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)'}}>search</span>
              <input 
                type="text" 
                className="form-input" 
                placeholder={activeTab === 'stock' ? "Search products or SKU..." : "Search movements or reason..."}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                style={{paddingLeft: '2.5rem', width: '100%'}}
              />
            </div>
            <div className="toolbar-filters" style={{display: 'flex', gap: '0.75rem'}}>
              {activeTab === 'stock' ? (
                <select 
                  className="form-select" 
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                >
                  <option value="">All Stock</option>
                  <option value="Low Stock">Low Stock Only</option>
                </select>
              ) : (
                <select 
                  className="form-select" 
                  value={movementTypeFilter}
                  onChange={(e) => { setMovementTypeFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                >
                  <option value="">All Types (IN & OUT)</option>
                  <option value="IN">Stock IN only</option>
                  <option value="OUT">Stock OUT only</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)'}}>
            <div className="spinner" style={{margin: '0 auto 1rem', borderColor: 'var(--primary-container)', borderTopColor: 'transparent'}}></div>
            Loading {activeTab === 'stock' ? 'inventory stock' : 'movement records'}...
          </div>
        ) : error ? (
          <div style={{padding: '3rem', textAlign: 'center'}}>
            <p style={{color: 'var(--error-red)', marginBottom: '1rem'}}>{error}</p>
            <button className="btn btn-secondary" onClick={fetchInventoryData}>
              <span className="material-symbols-outlined">refresh</span>
              Retry
            </button>
          </div>
        ) : activeTab === 'stock' ? (
          /* Stock Levels View */
          products.length === 0 ? (
            <div style={{padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)'}}>
              <span className="material-symbols-outlined" style={{fontSize: '48px', color: 'var(--outline)', marginBottom: '0.5rem'}}>inventory_2</span>
              <p style={{fontSize: '1.1rem', fontWeight: 500, color: 'var(--on-surface)'}}>No products found</p>
            </div>
          ) : (
            <>
              <div className="table-responsive" style={{overflowX: 'auto'}}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th style={{textAlign: 'right'}}>Current Stock</th>
                      <th style={{textAlign: 'right'}}>Min Level</th>
                      <th>Status</th>
                      {canAdjustStock && <th style={{textAlign: 'right'}}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(item => (
                      <tr key={item.id}>
                        <td>
                          <Link to={`/products/${item.id}`} style={{fontWeight: 600, color: 'var(--primary-container)', textDecoration: 'none'}}>
                            {item.product_name}
                          </Link>
                        </td>
                        <td>
                          <span style={{fontFamily: 'monospace', color: 'var(--on-surface-variant)'}}>{item.sku}</span>
                        </td>
                        <td>{item.category}</td>
                        <td style={{color: item.warehouse_location ? 'inherit' : 'var(--outline)'}}>{item.warehouse_location || '-'}</td>
                        <td style={{textAlign: 'right'}}>
                          <span style={{
                            fontWeight: 700,
                            color: item.is_low_stock ? 'var(--error-red)' : 'var(--on-surface)'
                          }}>
                            {item.current_stock}
                          </span>
                        </td>
                        <td style={{textAlign: 'right', color: 'var(--outline)'}}>{item.minimum_stock}</td>
                        <td>
                          {item.is_low_stock ? (
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
                        {canAdjustStock && (
                          <td style={{textAlign: 'right'}}>
                            <div style={{display: 'inline-flex', gap: '0.25rem'}}>
                              <Link to="/inventory/stock-in" className="btn btn-ghost btn-sm" title="Stock IN" style={{color: 'var(--success-green)'}}>
                                <span className="material-symbols-outlined" style={{fontSize: '18px'}}>add_circle</span>
                              </Link>
                              <Link to="/inventory/stock-out" className="btn btn-ghost btn-sm" title="Stock OUT" style={{color: 'var(--error-red)'}}>
                                <span className="material-symbols-outlined" style={{fontSize: '18px'}}>remove_circle</span>
                              </Link>
                            </div>
                          </td>
                        )}
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
          )
        ) : (
          /* Movement Log View */
          movements.length === 0 ? (
            <div style={{padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)'}}>
              <span className="material-symbols-outlined" style={{fontSize: '48px', color: 'var(--outline)', marginBottom: '0.5rem'}}>history_toggle_off</span>
              <p style={{fontSize: '1.1rem', fontWeight: 500, color: 'var(--on-surface)'}}>No stock movements found</p>
            </div>
          ) : (
            <>
              <div className="table-responsive" style={{overflowX: 'auto'}}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Type</th>
                      <th style={{textAlign: 'right'}}>Quantity</th>
                      <th>Reason</th>
                      <th>Logged By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map(m => (
                      <tr key={m.id}>
                        <td style={{whiteSpace: 'nowrap', color: 'var(--on-surface-variant)'}}>
                          {new Date(m.created_at).toLocaleString()}
                        </td>
                        <td>
                          <Link to={`/products/${m.product_id}`} style={{fontWeight: 600, color: 'var(--primary-container)', textDecoration: 'none'}}>
                            {m.product_name}
                          </Link>
                        </td>
                        <td style={{fontFamily: 'monospace', color: 'var(--outline)'}}>{m.sku}</td>
                        <td>
                          {m.movement_type === 'IN' ? (
                            <span className="badge badge-success" style={{fontWeight: 600}}>+ IN</span>
                          ) : (
                            <span className="badge badge-info" style={{fontWeight: 600, color: '#0284c7'}}>- OUT</span>
                          )}
                        </td>
                        <td style={{textAlign: 'right', fontWeight: 600, color: m.movement_type === 'IN' ? 'var(--success-green)' : 'var(--on-surface)'}}>
                          {m.movement_type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                        </td>
                        <td>{m.reason || '-'}</td>
                        <td style={{color: 'var(--on-surface-variant)'}}>{m.created_by_name}</td>
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
          )
        )}
      </div>
    </AppLayout>
  );
};

export default InventoryList;
