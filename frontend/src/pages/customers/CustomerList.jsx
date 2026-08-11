import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const { addToast } = useToast();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (typeFilter) params.customer_type = typeFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/customers', { params });
      if (res.data.success) {
        setCustomers(res.data.data);
        setPagination(prev => ({
          ...prev,
          total: res.data.pagination.total,
          totalPages: res.data.pagination.totalPages
        }));
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || 'Unable to load customers');
      addToast(err.response?.data?.message || 'Unable to load customers', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, typeFilter, statusFilter, addToast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTypeChange = (e) => {
    setTypeFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
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
        <div className="card-header" style={{padding: '1rem'}}>
          <div className="toolbar" style={{display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', width: '100%', padding: 0, background: 'transparent'}}>
            <div className="toolbar-search" style={{flex: '1', minWidth: '240px', position: 'relative'}}>
              <span className="material-symbols-outlined search-icon" style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)'}}>search</span>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search by name, business, phone, email..." 
                value={searchTerm}
                onChange={handleSearchChange}
                style={{paddingLeft: '2.5rem', width: '100%'}}
              />
            </div>
            <div className="toolbar-filters" style={{display: 'flex', gap: '0.75rem'}}>
              <select 
                className="form-select" 
                value={typeFilter}
                onChange={handleTypeChange}
              >
                <option value="">All Types</option>
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Distributor">Distributor</option>
              </select>
              <select 
                className="form-select" 
                value={statusFilter}
                onChange={handleStatusChange}
              >
                <option value="">All Statuses</option>
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)'}}>
            <div className="spinner" style={{margin: '0 auto 1rem', borderColor: 'var(--primary-container)', borderTopColor: 'transparent'}}></div>
            Loading customers...
          </div>
        ) : error ? (
          <div style={{padding: '3rem', textAlign: 'center'}}>
            <p style={{color: 'var(--error-red)', marginBottom: '1rem'}}>{error}</p>
            <button className="btn btn-secondary" onClick={fetchCustomers}>
              <span className="material-symbols-outlined">refresh</span>
              Retry
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div style={{padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)'}}>
            <span className="material-symbols-outlined" style={{fontSize: '48px', color: 'var(--outline)', marginBottom: '0.5rem'}}>person_off</span>
            <p style={{fontSize: '1.1rem', fontWeight: 500, color: 'var(--on-surface)', marginBottom: '0.5rem'}}>No customers found</p>
            <p style={{fontSize: '0.9rem', marginBottom: '1.5rem'}}>
              {searchTerm || typeFilter || statusFilter ? 'Try adjusting your search or filters' : 'Get started by creating your first customer.'}
            </p>
            {searchTerm || typeFilter || statusFilter ? (
              <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setTypeFilter(''); setStatusFilter(''); }}>
                Clear Filters
              </button>
            ) : (
              <Link to="/customers/new" className="btn btn-primary">
                <span className="material-symbols-outlined">add</span>
                Add Customer
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="table-responsive" style={{overflowX: 'auto'}}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Business Name</th>
                    <th>Contact</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Follow-up</th>
                    <th style={{textAlign: 'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.id}>
                      <td>
                        <Link to={`/customers/${customer.id}`} style={{fontWeight: 600, color: 'var(--primary-container)', textDecoration: 'none'}}>
                          {customer.customer_name}
                        </Link>
                      </td>
                      <td>{customer.business_name || '-'}</td>
                      <td>
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                          <span>{customer.mobile_number}</span>
                          {customer.email && <span style={{fontSize: '0.75rem', color: 'var(--outline)'}}>{customer.email}</span>}
                        </div>
                      </td>
                      <td>
                        <Badge type={customer.customer_type ? customer.customer_type.toLowerCase() : 'retail'}>
                          {customer.customer_type}
                        </Badge>
                      </td>
                      <td>
                        <Badge type={customer.status ? customer.status.toLowerCase() : 'lead'}>
                          {customer.status}
                        </Badge>
                      </td>
                      <td style={{color: customer.follow_up_date ? 'inherit' : 'var(--outline)'}}>
                        {customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : '-'}
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <div style={{display: 'inline-flex', gap: '0.25rem'}}>
                          <Link to={`/customers/${customer.id}`} className="btn btn-ghost btn-sm" title="View Details" style={{padding: '4px 8px'}}>
                            <span className="material-symbols-outlined" style={{fontSize: '18px'}}>visibility</span>
                          </Link>
                          <Link to={`/customers/${customer.id}/edit`} className="btn btn-ghost btn-sm" title="Edit Customer" style={{padding: '4px 8px'}}>
                            <span className="material-symbols-outlined" style={{fontSize: '18px'}}>edit</span>
                          </Link>
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

export default CustomerList;
