import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';

const ChallanList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mock data
  const mockChallans = [
    { id: 'CHL-2023-089', customer: 'Sharma Electronics', items: 3, totalQty: 145, amount: '₹14,500', date: 'Oct 24, 2023', status: 'Draft' },
    { id: 'CHL-2023-088', customer: 'Global Trading Co.', items: 12, totalQty: 540, amount: '₹89,200', date: 'Oct 23, 2023', status: 'Confirmed' },
    { id: 'CHL-2023-087', customer: 'Singh Distributors', items: 1, totalQty: 50, amount: '₹5,000', date: 'Oct 22, 2023', status: 'Confirmed' },
    { id: 'CHL-2023-086', customer: 'Gupta Enterprises', items: 5, totalQty: 120, amount: '₹22,400', date: 'Oct 20, 2023', status: 'Cancelled' },
    { id: 'CHL-2023-085', customer: 'Reddy Agencies', items: 8, totalQty: 310, amount: '₹45,600', date: 'Oct 19, 2023', status: 'Confirmed' },
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
      <div className="page-header">
        <div className="flex-between" style={{display: 'flex', justifyContent: 'space-between'}}>
          <div>
            <h1 className="page-title">Sales Challans</h1>
            <p className="page-subtitle">Manage delivery challans and shipments</p>
          </div>
          <Link to="/challans/new" className="btn btn-primary">
            <span className="material-symbols-outlined">add</span>
            Create Challan
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar" style={{display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'}}>
            <div className="toolbar-search form-input-icon-wrapper" style={{flex: '1', minWidth: '250px', position: 'relative'}}>
              <span className="material-symbols-outlined input-icon" style={{position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)'}}>search</span>
              <input 
                type="text" 
                className="form-input form-input-with-icon" 
                placeholder="Search by Challan # or Customer..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{paddingLeft: '2.5rem', width: '100%'}}
              />
            </div>
            <div className="toolbar-filters">
              <select 
                className="form-select" 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Draft</option>
                <option>Confirmed</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Challan #</th>
                <th>Customer</th>
                <th className="text-right">Items</th>
                <th className="text-right">Total Qty</th>
                <th className="text-right">Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockChallans.map(challan => (
                <tr key={challan.id}>
                  <td>
                    <Link to={`/challans/${challan.id}`} style={{fontWeight: 600, color: 'var(--primary-container)', textDecoration: 'none'}}>
                      {challan.id}
                    </Link>
                  </td>
                  <td>{challan.customer}</td>
                  <td className="text-right">{challan.items}</td>
                  <td className="text-right">{challan.totalQty}</td>
                  <td className="text-right">{challan.amount}</td>
                  <td>{challan.date}</td>
                  <td>{getStatusBadge(challan.status)}</td>
                  <td className="text-right">
                    <button className="btn btn-ghost btn-sm" title="Print">
                      <span className="material-symbols-outlined">print</span>
                    </button>
                    <button className="btn btn-ghost btn-sm" title="Options">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="card-body border-top">
          <Pagination 
            currentPage={currentPage} 
            totalPages={12} 
            onPageChange={setCurrentPage} 
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default ChallanList;
