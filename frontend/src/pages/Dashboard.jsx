import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import Badge from '../components/common/Badge';
import api from '../services/api';
import { useToast } from '../components/common/Toast';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    lowStockItems: 0,
    draftChallans: 0,
    confirmedChallans: 0,
    recentChallans: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToast } = useToast();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError(err.response?.data?.message || 'Unable to load dashboard data');
      addToast(err.response?.data?.message || 'Unable to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed': return <Badge type="confirmed">Confirmed</Badge>;
      case 'Draft': return <Badge type="draft">Draft</Badge>;
      case 'Cancelled': return <Badge type="cancelled">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const totalChallans = stats.draftChallans + stats.confirmedChallans;
  const confirmedPct = totalChallans > 0 ? Math.round((stats.confirmedChallans / totalChallans) * 100) : 0;
  const draftPct = totalChallans > 0 ? Math.round((stats.draftChallans / totalChallans) * 100) : 0;

  return (
    <AppLayout>
      <div className="dashboard-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Executive overview of enterprise operations</p>
          </div>
        </div>

        {loading ? (
          <div style={{padding: '4rem', textAlign: 'center', color: 'var(--on-surface-variant)'}}>
            <div className="spinner" style={{margin: '0 auto 1rem', borderColor: 'var(--primary-container)', borderTopColor: 'transparent'}}></div>
            Loading dashboard...
          </div>
        ) : error ? (
          <div className="card" style={{padding: '3rem', textAlign: 'center'}}>
            <p style={{color: 'var(--error-red)', marginBottom: '1rem'}}>{error}</p>
            <button className="btn btn-secondary" onClick={fetchStats}>
              <span className="material-symbols-outlined">refresh</span>
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-label">Total Customers</span>
                  <span className="material-symbols-outlined kpi-icon text-secondary">group</span>
                </div>
                <div className="kpi-value">{stats.totalCustomers}</div>
                <div className="kpi-trend">
                  <Link to="/customers" style={{color: 'var(--primary-container)', textDecoration: 'none', fontSize: '12px'}}>
                    Manage customers →
                  </Link>
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-label">Total Products</span>
                  <span className="material-symbols-outlined kpi-icon text-primary">inventory_2</span>
                </div>
                <div className="kpi-value">{stats.totalProducts}</div>
                <div className="kpi-trend">
                  <Link to="/products" style={{color: 'var(--primary-container)', textDecoration: 'none', fontSize: '12px'}}>
                    View catalog →
                  </Link>
                </div>
              </div>

              <div className="kpi-card" style={{borderTop: '3px solid var(--warning-amber)'}}>
                <div className="kpi-header">
                  <span className="kpi-label">Low Stock Items</span>
                  <span className="material-symbols-outlined kpi-icon" style={{color: 'var(--warning-amber)'}}>warning</span>
                </div>
                <div className="kpi-value" style={{color: stats.lowStockItems > 0 ? 'var(--warning-amber)' : 'inherit'}}>
                  {stats.lowStockItems}
                </div>
                <div className="kpi-trend" style={{color: stats.lowStockItems > 0 ? 'var(--error-red)' : 'var(--success-green)'}}>
                  {stats.lowStockItems > 0 ? 'Items below threshold' : 'All stock levels healthy'}
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-label">Draft Challans</span>
                  <span className="material-symbols-outlined kpi-icon" style={{color: 'var(--outline)'}}>edit_document</span>
                </div>
                <div className="kpi-value">{stats.draftChallans}</div>
                <div className="kpi-trend">
                  <Link to="/challans" style={{color: 'var(--outline)', textDecoration: 'none', fontSize: '12px'}}>
                    Pending dispatch
                  </Link>
                </div>
              </div>

              <div className="kpi-card" style={{borderTop: '3px solid var(--success-green)'}}>
                <div className="kpi-header">
                  <span className="kpi-label">Confirmed Dispatches</span>
                  <span className="material-symbols-outlined kpi-icon" style={{color: 'var(--success-green)'}}>check_circle</span>
                </div>
                <div className="kpi-value" style={{color: 'var(--success-green)'}}>{stats.confirmedChallans}</div>
                <div className="kpi-trend text-success">
                  {totalChallans > 0 ? `${confirmedPct}% confirmation rate` : 'No challans yet'}
                </div>
              </div>
            </div>

            {/* Middle Row: Challan Breakdown & Quick Shortcuts */}
            <div className="dashboard-row">
              <div className="card col-2-3">
                <div className="card-header flex-between" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h2 className="card-title">Recent Delivery Challans</h2>
                  <Link to="/challans" className="btn btn-ghost btn-sm">View All</Link>
                </div>
                {stats.recentChallans.length === 0 ? (
                  <div style={{padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)'}}>
                    No recent challans found.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Challan #</th>
                          <th>Customer</th>
                          <th style={{textAlign: 'right'}}>Total Qty</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentChallans.map(c => (
                          <tr key={c.id}>
                            <td>
                              <Link to={`/challans/${c.id}`} style={{fontWeight: 600, color: 'var(--primary-container)', textDecoration: 'none'}}>
                                {c.challan_number}
                              </Link>
                            </td>
                            <td>{c.customer_name}</td>
                            <td style={{textAlign: 'right', fontWeight: 600}}>{c.total_quantity} units</td>
                            <td>{getStatusBadge(c.status)}</td>
                            <td style={{color: 'var(--on-surface-variant)'}}>{new Date(c.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="card col-1-3">
                <div className="card-header">
                  <h2 className="card-title">Challan Status Breakdown</h2>
                </div>
                <div className="card-body">
                  <div className="progress-group" style={{marginBottom: '1rem'}}>
                    <div className="progress-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem'}}>
                      <span>Confirmed ({stats.confirmedChallans})</span>
                      <span style={{fontWeight: 600}}>{confirmedPct}%</span>
                    </div>
                    <div className="progress-bar-bg" style={{height: '8px', background: 'var(--surface-background)', borderRadius: '4px', overflow: 'hidden'}}>
                      <div className="progress-bar" style={{width: `${confirmedPct}%`, height: '100%', background: 'var(--success-green)'}}></div>
                    </div>
                  </div>

                  <div className="progress-group" style={{marginBottom: '1rem'}}>
                    <div className="progress-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem'}}>
                      <span>Draft ({stats.draftChallans})</span>
                      <span style={{fontWeight: 600}}>{draftPct}%</span>
                    </div>
                    <div className="progress-bar-bg" style={{height: '8px', background: 'var(--surface-background)', borderRadius: '4px', overflow: 'hidden'}}>
                      <div className="progress-bar" style={{width: `${draftPct}%`, height: '100%', background: 'var(--warning-amber)'}}></div>
                    </div>
                  </div>

                  <div style={{marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-standard)'}}>
                    <Link to="/challans/new" className="btn btn-primary btn-sm" style={{width: '100%', justifyContent: 'center'}}>
                      <span className="material-symbols-outlined" style={{fontSize: '18px'}}>add</span>
                      Create New Challan
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Low Stock Alerts */}
            <div className="dashboard-row">
              <div className="card" style={{width: '100%'}}>
                <div className="card-header flex-between" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span className="material-symbols-outlined" style={{color: 'var(--warning-amber)'}}>warning</span>
                    <h2 className="card-title">Low Stock Alert List</h2>
                  </div>
                  <Link to="/inventory" className="btn btn-ghost btn-sm">Manage Inventory</Link>
                </div>
                {stats.lowStockProducts.length === 0 ? (
                  <div style={{padding: '2rem', textAlign: 'center', color: 'var(--success-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>All inventory levels are above their minimum stock thresholds.</span>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th>SKU</th>
                          <th>Category</th>
                          <th style={{textAlign: 'right'}}>Current Stock</th>
                          <th style={{textAlign: 'right'}}>Minimum Stock</th>
                          <th>Status</th>
                          <th style={{textAlign: 'right'}}>Quick Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.lowStockProducts.map(p => (
                          <tr key={p.id}>
                            <td>
                              <Link to={`/products/${p.id}`} style={{fontWeight: 600, color: 'var(--primary-container)', textDecoration: 'none'}}>
                                {p.product_name}
                              </Link>
                            </td>
                            <td style={{fontFamily: 'monospace', color: 'var(--on-surface-variant)'}}>{p.sku}</td>
                            <td>{p.category}</td>
                            <td style={{textAlign: 'right', fontWeight: 700, color: 'var(--error-red)'}}>
                              {p.current_stock}
                            </td>
                            <td style={{textAlign: 'right', color: 'var(--outline)'}}>{p.minimum_stock}</td>
                            <td>
                              <span className="badge badge-error" style={{display: 'inline-flex', alignItems: 'center', gap: '2px'}}>
                                <span className="material-symbols-outlined" style={{fontSize: '12px'}}>warning</span>
                                Needs Restock
                              </span>
                            </td>
                            <td style={{textAlign: 'right'}}>
                              <Link to="/inventory/stock-in" className="btn btn-secondary btn-sm" style={{borderColor: 'var(--success-green)', color: 'var(--success-green)'}}>
                                Stock IN
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
