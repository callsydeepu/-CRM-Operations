import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

const ChallanList = () => {
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
      console.error('Error loading challans:', err);
      setError(err.response?.data?.message || 'Unable to load sales challans');
      addToast(err.response?.data?.message || 'Unable to load sales challans', 'error');
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed': return <Badge type="confirmed">Confirmed</Badge>;
      case 'Draft': return <Badge type="draft">Draft</Badge>;
      case 'Cancelled': return <Badge type="cancelled">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem'}}>
          <div>
            <h1 className="page-title">Sales Challans</h1>
            <p className="page-subtitle">Generate, manage, and dispatch goods delivery challans</p>
          </div>
          <Link to="/challans/new" className="btn btn-primary">
            <span className="material-symbols-outlined">add</span>
            Create Challan
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
                placeholder="Search by Challan # or Customer..." 
                value={searchTerm}
                onChange={handleSearchChange}
                style={{paddingLeft: '2.5rem', width: '100%'}}
              />
            </div>
            <div className="toolbar-filters">
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
            <span className="material-symbols-outlined" style={{fontSize: '48px', color: 'var(--outline)', marginBottom: '0.5rem'}}>receipt_long</span>
            <p style={{fontSize: '1.1rem', fontWeight: 500, color: 'var(--on-surface)', marginBottom: '0.5rem'}}>No challans found</p>
            <p style={{fontSize: '0.9rem', marginBottom: '1.5rem'}}>
              {searchTerm || statusFilter ? 'Try clearing your filters' : 'Create your first delivery challan.'}
            </p>
            {searchTerm || statusFilter ? (
              <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>
                Clear Filters
              </button>
            ) : (
              <Link to="/challans/new" className="btn btn-primary">
                <span className="material-symbols-outlined">add</span>
                Create Challan
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="table-responsive" style={{overflowX: 'auto'}}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Challan #</th>
                    <th>Customer</th>
                    <th style={{textAlign: 'right'}}>Total Qty</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th style={{textAlign: 'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {challans.map(challan => (
                    <tr key={challan.id}>
                      <td>
                        <Link to={`/challans/${challan.id}`} style={{fontWeight: 600, color: 'var(--primary-container)', textDecoration: 'none'}}>
                          {challan.challan_number}
                        </Link>
                      </td>
                      <td>
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                          <span style={{fontWeight: 500}}>{challan.customer_name}</span>
                          {challan.business_name && <span style={{fontSize: '0.75rem', color: 'var(--outline)'}}>{challan.business_name}</span>}
                        </div>
                      </td>
                      <td style={{textAlign: 'right', fontWeight: 600}}>{challan.total_quantity} units</td>
                      <td style={{color: 'var(--on-surface-variant)'}}>{new Date(challan.created_at).toLocaleDateString()}</td>
                      <td>{getStatusBadge(challan.status)}</td>
                      <td style={{color: 'var(--on-surface-variant)'}}>{challan.created_by_name}</td>
                      <td style={{textAlign: 'right'}}>
                        <div style={{display: 'inline-flex', gap: '0.25rem'}}>
                          <Link to={`/challans/${challan.id}`} className="btn btn-ghost btn-sm" title="View Details" style={{padding: '4px 8px'}}>
                            <span className="material-symbols-outlined" style={{fontSize: '18px'}}>visibility</span>
                          </Link>
                          {challan.status === 'Draft' && (
                            <Link to={`/challans/${challan.id}/edit`} className="btn btn-ghost btn-sm" title="Edit Draft" style={{padding: '4px 8px'}}>
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
