import React from 'react';

const Badge = ({ type, children }) => {
  const typeClass = type ? `badge-${type}` : '';
  return (
    <span className={`badge ${typeClass}`}>
      {children}
    </span>
  );
};

export default Badge;
