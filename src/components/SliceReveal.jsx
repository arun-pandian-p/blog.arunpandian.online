import React from 'react';

const SliceReveal = ({ children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
};

export default SliceReveal;
