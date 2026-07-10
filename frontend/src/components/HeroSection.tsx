import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeroSectionProps {
  tagline?: string;
  title: React.ReactNode;
  subtitle: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ tagline, title, subtitle }) => {
  return (
    <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '20px', margin: '0 auto' }}>
      {tagline && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          background: 'var(--primary-glow)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.85rem',
          color: 'var(--primary)',
          margin: '0 auto',
          fontWeight: 600,
        }}>
          <Sparkles size={14} />
          <span>{tagline}</span>
        </div>
      )}
      
      <h1 style={{
        fontSize: '3.4rem',
        lineHeight: '1.15',
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
      }}>
        {title}
      </h1>
      
      <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        {subtitle}
      </p>
    </div>
  );
};

export default HeroSection;
