import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/common/Badge';

const ChallanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const [challan, setChallan] = useState({
    id: id || 'CHL-2023-089',
    customerName: 'Sharma Electronics',
    customerId: '1',
    customerAddress: '123 Tech Park, Andheri East, Mumbai, Maharashtra 400069',
    date: 'Oct 24, 2023',
    status: 'Draft',
    notes: 'Urgent delivery required via express transport.',
    createdBy: 'Admin User',
    items: [
      { id: 1, name: 'Widget A Pro', sku: 'WDG-A-001', qty: 10, unit: 'Pcs', price: 1250.00, amount: 12500.00, currentStock: 145 },
      { id: 2, name: 'Steel Bearings 5mm', sku: 'BRG-S-005', qty: 5, unit: 'Box', price: 450.00, amount: 2250.00, currentStock: 12 },
    ],
    totalAmount: 14750.00
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed': return <Badge type="confirmed">{status}</Badge>;
      case 'Draft': return <Badge type="draft">{status}</Badge>;
      case 'Cancelled': return <Badge type="cancelled">{status}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleConfirm = () => {
    // Check for stock issues (mock)
    const hasStockIssue = challan.items.some(item => item.qty > item.currentStock);
    
    if (hasStockIssue) {
      alert('Cannot confirm: Insufficient stock for one or more items.');
      return;
    }

    if (window.confirm('Are you sure you want to confirm this challan? This will deduct inventory and cannot be undone.')) {
      setChallan({...challan, status: 'Confirmed'});
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this draft?')) {
      setChallan({...challan, status: 'Cancelled'});
    }
  };

  return (
    <AppLayout>
      <div className="breadcrumb" style={{marginBottom: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.9rem'}}>
        <Link to="/challans" style={{color: 'var(--primary-container)', textDecoration: 'none'}}>Challans</Link> {'>'} {challan.id}
      </div>

      <div className="page-header flex-between" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{padding: '0.25rem'}}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="page-title" style={{margin: 0, display: 'flex', alignItems: 'center', gap: '1rem'}}>
              {challan.id}
              {getStatusBadge(challan.status)}
            </h1>
            <div style={{color: 'var(--on-surface-variant)', marginTop: '0.25rem'}}>Created on {challan.date} by {challan.createdBy}</div>
          </div>
        </div>
        
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <button className="btn btn-outline" style={{border: '1px solid var(--border-standard)'}}>
            <span className="material-symbols-outlined">print</span> Print
          </button>
          <button className="btn btn-outline" style={{border: '1px solid var(--border-standard)'}}>
            <span className="material-symbols-outlined">download</span> PDF
          </button>
          {challan.status === 'Draft' && (
            <Link to={`/challans/${challan.id}/edit`} className="btn btn-primary">
              <span className="material-symbols-outlined">edit</span> Edit
            </Link>
          )}
        </div>
      </div>

      {challan.status === 'Draft' && challan.items.some(item => item.qty > item.currentStock) && (
        <div style={{backgroundColor: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #ffeeba'}}>
          <span className="material-symbols-outlined">warning</span>
          <strong>Warning:</strong> One or more items in this challan exceed current inventory levels. Please restock before confirming.
        </div>
      )}

      <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem'}}>
        <div className="card" style={{flex: '1', minWidth: '300px'}}>
          <div className="card-header border-bottom">
            <h2 className="card-title">Customer Information</h2>
          </div>
          <div className="card-body">
            <div style={{fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--primary-container)'}}>
              <Link to={`/customers/${challan.customerId}`} style={{color: 'inherit', textDecoration: 'none'}}>
                {challan.customerName}
              </Link>
            </div>
            <div style={{color: 'var(--on-surface-variant)', lineHeight: 1.5, marginBottom: '1rem'}}>
              {challan.customerAddress}
            </div>
            
            {challan.notes && (
              <div style={{padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '0.9rem', borderLeft: '3px solid var(--outline)'}}>
                <strong>Notes:</strong> {challan.notes}
              </div>
            )}
          </div>
        </div>
        
        <div className="card" style={{flex: '1', minWidth: '300px'}}>
          <div className="card-header border-bottom">
            <h2 className="card-title">Summary</h2>
          </div>
          <div className="card-body">
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div>
                <div style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)'}}>Total Items</div>
                <div style={{fontWeight: 600, fontSize: '1.1rem'}}>{challan.items.length}</div>
              </div>
              <div>
                <div style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)'}}>Total Quantity</div>
                <div style={{fontWeight: 600, fontSize: '1.1rem'}}>
                  {challan.items.reduce((sum, item) => sum + item.qty, 0)}
                </div>
              </div>
              <div style={{gridColumn: '1 / -1', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-standard)'}}>
                <div style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)'}}>Total Value</div>
                <div style={{fontWeight: 700, fontSize: '1.5rem', color: 'var(--primary-container)'}}>
                  ₹{challan.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header border-bottom">
          <h2 className="card-title">Items</h2>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>SKU</th>
                <th className="text-right">Quantity</th>
                <th>Unit</th>
                <th className="text-right">Price (₹)</th>
                <th className="text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((item, index) => (
                <tr key={item.id} style={{backgroundColor: item.qty > item.currentStock ? '#fff5f5' : 'transparent'}}>
                  <td>{index + 1}</td>
                  <td style={{fontWeight: 500}}>
                    {item.name}
                    {item.qty > item.currentStock && challan.status === 'Draft' && (
                      <span style={{color: 'var(--error-red)', fontSize: '0.75rem', display: 'block'}}>Insufficient stock (Current: {item.currentStock})</span>
                    )}
                  </td>
                  <td style={{fontFamily: 'monospace', color: 'var(--on-surface-variant)'}}>{item.sku}</td>
                  <td className="text-right" style={{fontWeight: 600}}>{item.qty}</td>
                  <td>{item.unit}</td>
                  <td className="text-right">{item.price.toFixed(2)}</td>
                  <td className="text-right" style={{fontWeight: 600}}>{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{backgroundColor: '#f8f9fa', fontWeight: 700}}>
                <td colSpan="6" className="text-right">Grand Total:</td>
                <td className="text-right text-primary">₹{challan.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {challan.status === 'Draft' && (
          <div className="card-body border-top" style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#f8f9fa'}}>
            <button type="button" className="btn btn-outline text-error" onClick={handleCancel} style={{borderColor: 'var(--error-red)', color: 'var(--error-red)'}}>
              Cancel Draft
            </button>
            <button type="button" className="btn btn-primary bg-success" onClick={handleConfirm} style={{backgroundColor: 'var(--success-green)'}}>
              <span className="material-symbols-outlined">check_circle</span>
              Confirm Challan
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ChallanDetails;
