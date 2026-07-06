import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ label, size = 'md' }) => {
  

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <div 
        className="spinner" 
        style={{
          width: size === 'sm' ? '20px' : size === 'lg' ? '48px' : '36px',
          height: size === 'sm' ? '20px' : size === 'lg' ? '48px' : '36px',
        }}
      />
      {label && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</p>}
    </div>
  );
};
export default LoadingSpinner;
