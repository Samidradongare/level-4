import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, LogOut } from 'lucide-react';

interface NavBarProps {
  onNavigateToSettings: () => void;
  onLogout: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ onNavigateToSettings, onLogout }) => {
  const { user } = useAuth();

  return (
    <header
      className="app-header"
      style={{
        background: 'rgba(5, 8, 22, 0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Logo / App Name */}
      <div style={{ textDecoration: 'none', color: 'var(--text-primary)', cursor: 'default' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', margin: 0 }}>
          <span style={{ color: 'var(--primary)' }}>⚡ Usage</span>
          <span style={{ color: 'var(--text-primary)' }}>Pay</span>
        </h1>
      </div>

      {/* Right side: wallet badge, settings, logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <div
            title="Connected Wallet"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--success)',
                boxShadow: '0 0 10px var(--success-glow)',
              }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {user.wallet_address.substring(0, 6)}...{user.wallet_address.substring(user.wallet_address.length - 4)}
            </span>
          </div>
        )}
        <button
          className="btn btn-secondary"
          onClick={onNavigateToSettings}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Settings size={16} />
          <span className="nav-text">Settings</span>
        </button>
        <button
          className="btn btn-secondary"
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <LogOut size={16} />
          <span className="nav-text">Disconnect</span>
        </button>
      </div>
    </header>
  );
};

export default NavBar;
