import React from 'react';

interface NotFoundProps {
  onGoHome: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onGoHome }) => {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '24px',
    }}>
      <div className="glass-panel" style={{
        maxWidth: '480px',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <span style={{ fontSize: '3rem' }}>🛰️</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginTop: '12px' }}>
          404 - Lost in Orbit
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
          The page or cosmic coordinates you are searching for do not exist. Return back to base station.
        </p>
        <button className="btn btn-primary" onClick={onGoHome} style={{ width: '100%' }}>
          Back to Terminal
        </button>
      </div>
    </div>
  );
};
export default NotFound;
