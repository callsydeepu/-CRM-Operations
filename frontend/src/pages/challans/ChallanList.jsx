import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';

const ChallanList = () => {
  const { user } = useAuth();
  const canManageChallans = user?.role === 'Admin' || user?.role === 'Sales';

  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const { addToast } = useToast();

  const fetchChallans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/challans', { params });
      if (res.data.success) {
        setChallans(res.data.data);
        setPagination(prev => ({
          ...prev,
          total: res.data.pagination.total,
          totalPages: res.data.pagination.totalPages
        }));
      }
    } catch (err) {
      console.error('Error fetching challans:', err);
      setError(err.response?.data?.message || 'Unable to load challans');
      addToast(err.response?.data?.message || 'Unable to load challans', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter, addToast]);

  useEffect(() => {
    fetchChallans();
  }, [fetchChallans]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem'}}>
          <div>
            <h1 className="page-title">Sales Challans</h1>
            <p className="page-subtitle">Generate dispatch notes, manage draft delivery orders, and track dispatches</p>
          </div>
          {canManageChallans && (
            <Link to="/challans/new" className="btn btn-primary">
              <span className="material-symbols-outlined">add</span>
              Create Challan
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
                placeholder="Search by challan #, customer, or business..." 
                value={searchTerm}
                onChange={handleSearchChange}
                style={{paddingLeft: '2.5rem', width: '100%'}}
              />
            </div>
            <div className="toolbar-filters" style={{display: 'flex', gap: '0.75rem'}}>
              <select 
                className="form-select" 
                value={statusFilter}
                onChange={handleStatusChange}
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)'}}>
            <div className="spinner" style={{margin: '0 auto 1rem', borderColor: 'var(--primary-container)', borderTopColor: 'transparent'}}></div>
            Loading delivery challans...
          </div>
        ) : error ? (
          <div style={{padding: '3rem', textAlign: 'center'}}>
            <p style={{color: 'var(--error-red)', marginBottom: '1rem'}}>{error}</p>
            <button className="btn btn-secondary" onClick={fetchChallans}>
              <span className="material-symbols-outlined">refresh</span>
              Retry
            </button>
          </div>
        ) : challans.length === 0 ? (
          <div style={{padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)'}}>
            <span className="material-symbols-outlined" style={{fontSize: '48px', color: 'var(--outline)', marginBottom: '0.5rem'}}>local_shipping</span>
            <p style={{fontSize: '1.1rem', fontWeight: 500, color: 'var(--on-surface)', marginBottom: '0.5rem'}}>No sales challans found</p>
            <p style={{fontSize: '0.9rem', marginBottom: '1.5rem'}}>
              {searchTerm || statusFilter ? 'Try adjusting your search or filter' : (canManageChallans ? 'Create your first delivery challan to get started.' : 'No delivery records available.')}
            </p>
            {searchTerm || statusFilter ? (
              <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>
                Clear Filters
              </button>
            ) : canManageChallans ? (
              <Link to="/challans/new" className="btn btn-primary">
                <span className="material-symbols-outlined">add</span>
                Create Challan
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            <div className="table-responsive" style={{overflowX: 'auto'}}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Challan Number</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th style={{textAlign: 'right'}}>Total Items</th>
                    <th style={{textAlign: 'right'}}>Total Value</th>
                    <th>Status</th>
                    <th style={{textAlign: 'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {challans.map(item => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/challans/${item.id}`} style={{fontWeight: 600, color: 'var(--primary-container)', textDecoration: 'none', fontFamily: 'monospace'}}>
                          {item.challan_number}
                        </Link>
                      </td>
                      <td>
                        <div>
                          <div style={{fontWeight: 500}}>{item.customer_name}</div>
                          {item.business_name && (
                            <div style={{fontSize: '0.75rem', color: 'var(--outline)'}}>{item.business_name}</div>
                          )}
                        </div>
                      </td>
                      <td style={{whiteSpace: 'nowrap', color: 'var(--on-surface-variant)'}}>
                        {new Date(item.challan_date || item.created_at).toLocaleDateString()}
                      </td>
                      <td style={{textAlign: 'right', fontWeight: 500}}>
                        {item.total_items} {item.total_items === 1 ? 'item' : 'items'}
                      </td>
                      <td style={{textAlign: 'right', fontWeight: 600}}>
                        ₹{Number(item.total_amount || 0).toFixed(2)}
                      </td>
                      <td>
                        <Badge type={item.status ? item.status.toLowerCase() : 'draft'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <div style={{display: 'inline-flex', gap: '0.25rem'}}>
                          <Link to={`/challans/${item.id}`} className="btn btn-ghost btn-sm" title="View Details" style={{padding: '4px 8px'}}>
                            <span className="material-symbols-outlined" style={{fontSize: '18px'}}>visibility</span>
                          </Link>
                          {canManageChallans && item.status === 'Draft' && (
                            <Link to={`/challans/${item.id}/edit`} className="btn btn-ghost btn-sm" title="Edit Draft" style={{padding: '4px 8px'}}>
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

export default ChallanList;
