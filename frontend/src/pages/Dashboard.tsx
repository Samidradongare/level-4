import React from 'react';
import { useAuth } from '../context/AuthContext';
import BalanceCard from '../components/BalanceCard';
import AutoTopupSettings from '../components/AutoTopupSettings';
import SmartNotesInterface from '../components/SmartNotesInterface';
import UsageHistory from '../components/UsageHistory';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import useAnalytics from '../hooks/useAnalytics';
import { LogOut, Sliders } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
  onNavigateToSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, onNavigateToSettings }) => {
  const { user, disconnect } = useAuth();
  const { metrics, ledger, loading, refreshAnalytics } = useAnalytics();

  const handleLogoutClick = async () => {
    await disconnect();
    onLogout();
  };

  const handleRefreshAll = () => {
    refreshAnalytics();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header bar */}
      <header className="glass-panel" style={{
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        padding: '16px 24px',
        marginBottom: '32px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            ⚡ Usage<span style={{ color: 'var(--primary)' }}>Pay</span>
          </span>
          <span style={{
            fontSize: '0.65rem',
            padding: '2px 6px',
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>MVP</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(255,255,255,0.1)' }} title="Connected Wallet">
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success-glow)' }}></div>
              <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                {user.wallet_address.substring(0, 6)}...{user.wallet_address.substring(50)}
              </span>
            </div>
          )}
          
          <button 
            className="btn btn-secondary" 
            onClick={onNavigateToSettings}
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <Sliders size={16} />
            <span>Settings</span>
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={handleLogoutClick}
            style={{ padding: '8px 12px', fontSize: '0.85rem', borderColor: 'rgba(239, 68, 68, 0.2)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Layout Flex Box */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '32px',
          alignItems: 'flex-start'
        }}>
          
          {/* Left panel: Balance & topup settings */}
          <div style={{ flex: '1 1 300px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <BalanceCard />
            <AutoTopupSettings />
          </div>

          {/* Right panel: AI Summarizer & Charts */}
          <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '32px', minWidth: 0 }}>
            {/* AI notes panel */}
            <SmartNotesInterface onSummaryGenerated={handleRefreshAll} />

            {/* SVG graph dashboard charts */}
            <AnalyticsDashboard metrics={metrics} transactions={ledger} loading={loading} />
          </div>
        </div>

        {/* Transaction History ledger grid (Full Width Bottom) */}
        <div style={{ marginTop: '16px' }}>
          <UsageHistory transactions={ledger} loading={loading} />
        </div>
      </main>
    </div>
  );
};
export default Dashboard;
