import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/common/Badge';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const customer = {
    id: id,
    name: 'Rahul Sharma',
    businessName: 'Sharma Electronics',
    email: 'rahul@sharmaelectronics.com',
    phone: '+91 9876543210',
    type: 'Retail',
    status: 'Active',
    gstNumber: '27AAPCS8732P1Z9',
    address: '123 Tech Park, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400069',
    notes: 'Key client for smart home devices. Prefers contact via email.',
    createdAt: 'Jan 15, 2023',
    followUp: 'Oct 26, 2023'
  };

  return (
    <AppLayout>
      <div className="breadcrumb" style={{marginBottom: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>
        <Link to="/customers" style={{color: 'var(--primary-container)', textDecoration: 'none'}}>Customers</Link> {'>'} {customer.name}
      </div>

      <div className="page-header flex-between" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{padding: '0.25rem'}}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="page-title" style={{margin: 0}}>{customer.name}</h1>
          <Badge type={customer.status.toLowerCase()}>{customer.status}</Badge>
          <Badge type={customer.type.toLowerCase()}>{customer.type}</Badge>
        </div>
        <Link to={`/customers/${id}/edit`} className="btn btn-secondary">
          <span className="material-symbols-outlined">edit</span>
          Edit
        </Link>
      </div>

      <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap'}}>
        <div className="card" style={{flex: '2', minWidth: '300px'}}>
          <div className="card-header border-bottom">
            <h2 className="card-title">Customer Information</h2>
          </div>
          <div className="card-body">
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem'}}>
              <div>
                <div style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem'}}>Business Name</div>
                <div style={{fontWeight: 500}}>{customer.businessName}</div>
              </div>
              <div>
                <div style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem'}}>GST Number</div>
                <div style={{fontWeight: 500}}>{customer.gstNumber || 'N/A'}</div>
              </div>
              <div>
                <div style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem'}}>Email</div>
                <div style={{fontWeight: 500}}><a href={`mailto:${customer.email}`} style={{color: 'var(--primary-container)', textDecoration: 'none'}}>{customer.email}</a></div>
              </div>
              <div>
                <div style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem'}}>Phone</div>
                <div style={{fontWeight: 500}}>{customer.phone}</div>
              </div>
            </div>

            <div style={{marginBottom: '2rem'}}>
              <div style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem'}}>Address</div>
              <div style={{lineHeight: 1.5}}>
                {customer.address}<br />
                {customer.city}, {customer.state} {customer.pincode}
              </div>
            </div>

            <div>
              <div style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '0.25rem'}}>Notes</div>
              <div style={{padding: '1rem', background: 'var(--surface-background)', borderRadius: '4px', fontSize: '0.9rem'}}>
                {customer.notes}
              </div>
            </div>
          </div>
        </div>

        <div style={{flex: '1', minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div className="card">
            <div className="card-header border-bottom">
              <h2 className="card-title">Activity Tracking</h2>
            </div>
            <div className="card-body">
              <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem'}}>
                <span className="material-symbols-outlined" style={{color: 'var(--warning-amber)'}}>event</span>
                <div>
                  <div style={{fontWeight: 500, marginBottom: '0.25rem'}}>Next Follow-up</div>
                  <div style={{fontSize: '0.9rem', color: 'var(--on-surface-variant)'}}>{customer.followUp}</div>
                </div>
              </div>
              <button className="btn btn-outline" style={{width: '100%', justifyContent: 'center', border: '1px solid var(--border-standard)'}}>
                Update Schedule
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header border-bottom">
              <h2 className="card-title">Recent Orders</h2>
            </div>
            <div className="card-body" style={{padding: 0}}>
              <div style={{padding: '1rem', borderBottom: '1px solid var(--border-standard)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <div style={{fontWeight: 500, color: 'var(--primary-container)'}}>CHL-2023-001</div>
                  <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)'}}>Oct 24, 2023</div>
                </div>
                <Badge type="confirmed">Confirmed</Badge>
              </div>
              <div style={{padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <div style={{fontWeight: 500, color: 'var(--primary-container)'}}>CHL-2023-018</div>
                  <div style={{fontSize: '0.8rem', color: 'var(--on-surface-variant)'}}>Sep 12, 2023</div>
                </div>
                <Badge type="confirmed">Confirmed</Badge>
              </div>
            </div>
            <div className="card-body border-top" style={{textAlign: 'center', padding: '0.75rem'}}>
              <a href="#" style={{color: 'var(--primary-container)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500}}>View All Orders</a>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CustomerDetails;
