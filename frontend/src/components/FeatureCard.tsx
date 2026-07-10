import React from 'react';
import Card from './Card';

interface FeatureCardProps {
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  iconBgColor = 'var(--primary-glow)',
  iconColor = 'var(--primary)',
  title,
  description
}) => {
  return (
    <Card className="lift-hover">
      <div style={{
        padding: '10px',
        width: 'fit-content',
        borderRadius: 'var(--radius-md)',
        background: iconBgColor,
        color: iconColor,
        marginBottom: '16px'
      }}>
        {icon}
      </div>
      <h4 style={{ marginBottom: '8px', fontSize: '1.1rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
        {description}
      </p>
    </Card>
  );
};

export default FeatureCard;
