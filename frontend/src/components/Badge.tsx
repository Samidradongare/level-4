import React from 'react';

interface BadgeProps {
  type?: 'success' | 'warning' | 'error';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ type = 'warning', children, style }) => {
  const badgeClass = `badge badge-${type}`;
  return (
    <span className={badgeClass} style={style}>
      {children}
    </span>
  );
};

export default Badge;
