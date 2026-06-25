import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export const WalletConnect: React.FC = () => {
  const { user, connectWallet, disconnect, loading, isSimulatedWallet } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);

  const handleConnect = async () => {
    setErrorMsg(null);
    setConnecting(true);
    try {
      await connectWallet();
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection failed.');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="sm" />;
  }

  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)' }}>
            <CheckCircle size={14} />
            <span>Connected</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {user.wallet_address.substring(0, 6)}...{user.wallet_address.substring(50)}
          </span>
        </div>
        <button className="btn btn-secondary" onClick={disconnect} style={{ padding: '8px 12px' }}>
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <button 
        className="btn btn-primary" 
        onClick={handleConnect} 
        disabled={connecting}
        style={{ width: '100%', padding: '14px 28px', fontSize: '1rem' }}
      >
        {connecting ? (
          <LoadingSpinner size="sm" label="Connecting..." />
        ) : (
          <>
            <Wallet size={20} />
            <span>Connect Freighter Wallet</span>
          </>
        )}
      </button>
      
      {isSimulatedWallet && (
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          padding: '10px 12px',
          background: 'var(--warning-glow)',
          border: '1px solid var(--warning)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          color: 'var(--warning)',
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>Freighter extension not found. Starting in **developer simulator mode** with mock keys.</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '10px 12px',
          background: 'var(--error-glow)',
          border: '1px solid var(--error)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          color: 'var(--error)',
          textAlign: 'center',
        }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
};
export default WalletConnect;
