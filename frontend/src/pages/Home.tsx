import React from 'react';
import { useAuth } from '../context/AuthContext';
import WalletConnect from '../components/WalletConnect';
import { Sparkles, Coins, Zap, ShieldCheck } from 'lucide-react';

interface HomeProps {
  onLoginSuccess: () => void;
}

export const Home: React.FC<HomeProps> = ({ onLoginSuccess }) => {
  const { user } = useAuth();

  // If user connects, let them enter the dashboard
  React.useEffect(() => {
    if (user) {
      onLoginSuccess();
    }
  }, [user, onLoginSuccess]);

  return (
    <div className="container" style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '48px',
      textAlign: 'center',
      paddingTop: '60px',
    }}>
      
      {/* Hero Header */}
      <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          <span>Stellar Soroban Testnet Demo</span>
        </div>
        
        <h1 style={{
          fontSize: '3.4rem',
          lineHeight: '1.15',
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
        }}>
          Metered Payments for <br />
          <span className="gradient-text">Next-Generation APIs</span>
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Fund your UsagePay smart contract escrow balance, set up automatic top-up thresholds, and pay per-request for AI study summaries instantly using XLM.
        </p>
      </div>

      {/* Wallet Connect Onboarding Panel */}
      <div className="glass-panel" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '36px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>Welcome to UsagePay</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          To test SmartNotes AI note summarizations and explore analytics, authorize Freighter wallet to sign in.
        </p>
        <WalletConnect />
      </div>

      {/* Feature Grids */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        maxWidth: '900px',
        width: '100%',
        marginTop: '20px',
      }}>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
          <div style={{ padding: '10px', width: 'fit-content', borderRadius: 'var(--radius-md)', background: 'var(--primary-glow)', color: 'var(--primary)', marginBottom: '16px' }}>
            <Coins size={20} />
          </div>
          <h4 style={{ marginBottom: '8px' }}>Escrow pre-funding</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Deposit XLM into a secure escrow on-chain. Services debit only what you request, protecting your primary wallet.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
          <div style={{ padding: '10px', width: 'fit-content', borderRadius: 'var(--radius-md)', background: 'var(--success-glow)', color: 'var(--success)', marginBottom: '16px' }}>
            <Zap size={20} />
          </div>
          <h4 style={{ marginBottom: '8px' }}>Auto-Topup Triggers</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Configure automatic threshold limits. If your balance drops below trigger values, it reloads instantly.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
          <div style={{ padding: '10px', width: 'fit-content', borderRadius: 'var(--radius-md)', background: 'var(--error-glow)', color: 'var(--error)', marginBottom: '16px' }}>
            <ShieldCheck size={20} />
          </div>
          <h4 style={{ marginBottom: '8px' }}>Off-chain audit sync</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Hourly reconciliation workers compare off-chain server logs against on-chain Soroban events to prevent fraud.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Home;
