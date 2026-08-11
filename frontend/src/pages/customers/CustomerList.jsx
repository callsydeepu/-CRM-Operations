import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mock data
  const mockCustomers = [
    { id: 1, name: 'Rahul Sharma', business: 'Sharma Electronics', contact: '+91 9876543210', type: 'Retail', status: 'Active', followUp: 'Today' },
    { id: 2, name: 'Priya Patel', business: 'Global Trading Co.', contact: '+91 8765432109', type: 'Wholesale', status: 'Active', followUp: 'Oct 26' },
    { id: 3, name: 'Amit Singh', business: 'Singh Distributors', contact: '+91 7654321098', type: 'Distributor', status: 'Lead', followUp: 'Oct 28' },
    { id: 4, name: 'Neha Gupta', business: 'Gupta Enterprises', contact: '+91 6543210987', type: 'Retail', status: 'Inactive', followUp: '-' },
    { id: 5, name: 'Vikram Reddy', business: 'Reddy Agencies', contact: '+91 5432109876', type: 'Wholesale', status: 'Active', followUp: 'Nov 02' },
  ];

  return (
    <AppLayout>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Customers</h1>
            <p className="page-subtitle">Manage your customer relationships</p>
          </div>
          <Link to="/customers/new" className="btn btn-primary">
            <span className="material-symbols-outlined">add</span>
            Add Customer
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="toolbar">
            <div className="toolbar-search form-input-icon-wrapper">
              <span className="material-symbols-outlined input-icon">search</span>
              <input 
                type="text" 
                className="form-input form-input-with-icon" 
                placeholder="Search customers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="toolbar-filters" style={{display: 'flex', gap: '1rem'}}>
              <select 
                className="form-select" 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option>All Types</option>
                <option>Retail</option>
                <option>Wholesale</option>
                <option>Distributor</option>
              </select>
              <select 
                className="form-select" 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Statuses</option>
                <option>Lead</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Business Name</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Status</th>
                <th>Follow-up</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>
                    <Link to={`/customers/${customer.id}`} style={{fontWeight: 500, color: 'var(--primary-container)'}}>
                      {customer.name}
                    </Link>
                  </td>
                  <td>{customer.business}</td>
                  <td>{customer.contact}</td>
                  <td><Badge type={customer.type.toLowerCase()}>{customer.type}</Badge></td>
                  <td><Badge type={customer.status.toLowerCase()}>{customer.status}</Badge></td>
                  <td>{customer.followUp}</td>
                  <td className="text-right">
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
            totalPages={3} 
            onPageChange={setCurrentPage} 
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default CustomerList;
