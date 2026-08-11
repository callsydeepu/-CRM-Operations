import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/Layout/AppLayout';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mock data
  const mockProducts = [
    { id: 1, name: 'Widget A Pro', sku: 'WDG-A-001', category: 'Electronics', unit: 'Pcs', price: '₹1,250.00', stock: 145, status: 'Active' },
    { id: 2, name: 'Steel Bearings 5mm', sku: 'BRG-S-005', category: 'Hardware', unit: 'Box (100)', price: '₹450.00', stock: 12, status: 'Active' },
    { id: 3, name: 'Copper Wire 2mm', sku: 'WIR-C-002', category: 'Electrical', unit: 'Meter', price: '₹85.00', stock: 8, status: 'Active' },
    { id: 4, name: 'Circuit Board v2', sku: 'CRB-V2-001', category: 'Electronics', unit: 'Pcs', price: '₹3,400.00', stock: 2, status: 'Active' },
    { id: 5, name: 'Legacy Widget B', sku: 'WDG-B-OLD', category: 'Electronics', unit: 'Pcs', price: '₹800.00', stock: 0, status: 'Inactive' },
  ];

  return (
    <AppLayout>
      <div className="page-header">
        <div className="flex-between" style={{display: 'flex', justifyContent: 'space-between'}}>
          <div>
            <h1 className="page-title">Products</h1>
            <p className="page-subtitle">Manage your product catalog</p>
          </div>
          <Link to="/products/new" className="btn btn-primary">
            <span className="material-symbols-outlined">add</span>
            Add Product
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
                placeholder="Search products by name or SKU..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{paddingLeft: '2.5rem', width: '100%'}}
              />
            </div>
            <div className="toolbar-filters">
              <select 
                className="form-select" 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Hardware</option>
                <option>Electrical</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Unit</th>
                <th className="text-right">Price</th>
                <th className="text-right">Stock</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    <Link to={`/products/${product.id}`} style={{fontWeight: 500, color: 'var(--primary-container)', textDecoration: 'none'}}>
                      {product.name}
                    </Link>
                  </td>
                  <td style={{fontFamily: 'monospace', color: 'var(--on-surface-variant)'}}>{product.sku}</td>
                  <td>{product.category}</td>
                  <td>{product.unit}</td>
                  <td className="text-right">{product.price}</td>
                  <td className="text-right" style={{
                    fontWeight: 600, 
                    color: product.stock <= 15 && product.stock > 0 ? 'var(--warning-amber)' : 
                           product.stock === 0 ? 'var(--error-red)' : 'inherit'
                  }}>
                    {product.stock}
                  </td>
                  <td>
                    <Badge type={product.status === 'Active' ? 'active' : 'inactive'}>
                      {product.status}
                    </Badge>
                  </td>
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
            totalPages={5} 
            onPageChange={setCurrentPage} 
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default ProductList;
