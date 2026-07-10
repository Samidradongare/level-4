import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', style }) => {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        padding: '24px',
        animation: 'fadeIn var(--transition-normal)',
        ...style
      }}
    >
      {title && (
        <div style={{ marginBottom: '16px', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
