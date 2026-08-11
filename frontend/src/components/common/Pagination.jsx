import React from 'react';

const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const getPages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing <span>{start}</span> to <span>{end}</span> of <span>{totalItems}</span> results
      </div>
      <div className="pagination-buttons">
        <button 
          className="pagination-btn" 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
        </button>
        
        {getPages().map(page => (
          <button
            key={page}
            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button 
          className="pagination-btn" 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
