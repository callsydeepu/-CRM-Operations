import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import Badge from '../components/common/Badge';
import './Dashboard.css';

const Dashboard = () => {
  const recentChallans = [
    { id: 'CHL-2023-001', customer: 'Acme Corp', qty: 150, status: 'Confirmed', date: 'Oct 24, 2023' },
    { id: 'CHL-2023-002', customer: 'Global Tech', qty: 45, status: 'Draft', date: 'Oct 24, 2023' },
    { id: 'CHL-2023-003', customer: 'Star Industries', qty: 320, status: 'Confirmed', date: 'Oct 23, 2023' },
    { id: 'CHL-2023-004', customer: 'Nexus Retail', qty: 12, status: 'Cancelled', date: 'Oct 22, 2023' },
  ];

  const lowStockItems = [
    { name: 'Widget A', stock: 5 },
    { name: 'Steel Bearings', stock: 12 },
    { name: 'Copper Wire', stock: 8 },
    { name: 'Circuit Board v2', stock: 2 },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed': return <Badge type="confirmed">{status}</Badge>;
      case 'Draft': return <Badge type="draft">{status}</Badge>;
      case 'Cancelled': return <Badge type="cancelled">{status}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="dashboard-page">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your business operations</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Customers</span>
              <span className="material-symbols-outlined kpi-icon text-secondary">group</span>
            </div>
            <div className="kpi-value">1,248</div>
            <div className="kpi-trend text-success">+12% from last month</div>
          </div>
          
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Products</span>
              <span className="material-symbols-outlined kpi-icon text-primary">inventory_2</span>
            </div>
            <div className="kpi-value">842</div>
            <div className="kpi-trend">Active in catalog</div>
          </div>

          <div className="kpi-card border-warning">
            <div className="kpi-header">
              <span className="kpi-label">Low Stock</span>
              <span className="material-symbols-outlined kpi-icon text-warning">warning</span>
            </div>
            <div className="kpi-value text-warning">14</div>
            <div className="kpi-trend">Items need reorder</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Draft Challans</span>
              <span className="material-symbols-outlined kpi-icon text-outline">edit_document</span>
            </div>
            <div className="kpi-value">23</div>
            <div className="kpi-trend">Pending confirmation</div>
          </div>

          <div className="kpi-card border-success">
            <div className="kpi-header">
              <span className="kpi-label">Confirmed</span>
              <span className="material-symbols-outlined kpi-icon text-success">check_circle</span>
            </div>
            <div className="kpi-value text-success">156</div>
            <div className="kpi-trend text-success">+5% this week</div>
          </div>
        </div>

        <div className="dashboard-row">
          <div className="card col-2-3">
            <div className="card-header flex-between">
              <h2 className="card-title">Stock Activity</h2>
              <Link to="/inventory" className="btn btn-ghost btn-sm">View Report</Link>
            </div>
            <div className="card-body chart-placeholder">
              [Chart: Stock IN vs OUT over time]
            </div>
          </div>

          <div className="card col-1-3">
            <div className="card-header">
              <h2 className="card-title">Challan Overview</h2>
            </div>
            <div className="card-body">
              <div className="progress-group">
                <div className="progress-header">
                  <span>Confirmed</span>
                  <span>68%</span>
                </div>
                <div className="progress-bar-bg"><div className="progress-bar bg-success" style={{width: '68%'}}></div></div>
              </div>
              <div className="progress-group">
                <div className="progress-header">
                  <span>Draft</span>
                  <span>22%</span>
                </div>
                <div className="progress-bar-bg"><div className="progress-bar bg-warning" style={{width: '22%'}}></div></div>
              </div>
              <div className="progress-group">
                <div className="progress-header">
                  <span>Cancelled</span>
                  <span>10%</span>
                </div>
                <div className="progress-bar-bg"><div className="progress-bar bg-error" style={{width: '10%'}}></div></div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-row">
          <div className="card col-2-3">
            <div className="card-header flex-between">
              <h2 className="card-title">Recent Challans</h2>
              <Link to="/challans" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Challan #</th>
                    <th>Customer</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentChallans.map(c => (
                    <tr key={c.id}>
                      <td><Link to={`/challans/${c.id}`}>{c.id}</Link></td>
                      <td>{c.customer}</td>
                      <td>{c.qty}</td>
                      <td>{getStatusBadge(c.status)}</td>
                      <td>{c.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card col-1-3">
            <div className="card-header flex-between">
              <h2 className="card-title">Low Stock</h2>
              <Link to="/inventory" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="text-right">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td className="text-right text-warning font-bold">{item.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
