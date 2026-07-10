// Settings page with Contract Balance and AutoTopupSettings side by side
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useBalance from '../hooks/useBalance';
import { api } from '../services/api';
import AutoTopupSettings from '../components/AutoTopupSettings';
import { ArrowLeft, Landmark, Send, Check, ShieldAlert } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

interface SettingsPageProps {
  onBackToDashboard: () => void;
}

export const Settings: React.FC<SettingsPageProps> = ({ onBackToDashboard }) => {
  const {} = useAuth();
  const { balanceXlm, refreshBalance } = useBalance();

  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Please enter a valid amount greater than zero.');
      return;
    }
    if (val > balanceXlm) {
      setErrorMsg(`Insufficient balance. You can withdraw up to ${balanceXlm} XLM.`);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccess(false);
    setTxHash(null);
    try {
      const response = await api.post('/user/withdraw', { amount_xlm: val });
      setTxHash(response.data.data.tx_hash);
      setSuccess(true);
      setWithdrawAmount('');
      refreshBalance();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Withdrawal failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="glass-panel" style={{
        borderRadius: 0,
        border: 'none',
        padding: '16px 24px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          onClick={onBackToDashboard}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            transition: 'background var(--transition-fast)'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <ArrowLeft size={20} />
        </button>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
          Settings & Configurations
        </span>
      </header>

      {/* Main grid */}
      <main className="container" style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Left side: Contract Balance and Auto‑Topup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Contract Balance */}
          <Card title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Landmark size={18} style={{ color: 'var(--primary)' }} />
              <span>Contract Balance</span>
            </div>
          }>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>Available Escrow Funds:</span>
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{balanceXlm.toFixed(2)} XLM</span>
            </div>
          </Card>
          
          {/* Auto‑Topup Settings */}
          <AutoTopupSettings />
        </div>

        {/* Right side: Withdraw form */}
        <Card title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Landmark size={18} style={{ color: 'var(--primary)' }} />
            <span>Withdraw Escrow Balance</span>
          </div>
        }>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Refund remaining XLM from the UsagePay contract escrow back to your Freighter wallet.
          </p>
          <form onSubmit={handleWithdraw}>
            <div className="form-group">
              <label className="form-label">Withdraw Amount (XLM)</label>
              <input
                type="number"
                className="form-input"
                step="any"
                min="0.0000001"
                placeholder="5.0"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                disabled={loading || balanceXlm <= 0}
                required
              />
            </div>
            {errorMsg && (
              <div style={{
                color: 'var(--error)',
                fontSize: '0.85rem',
                background: 'var(--error-glow)',
                border: '1px solid var(--error)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
                textAlign: 'center'
              }}>{errorMsg}</div>
            )}
            {success && (
              <div style={{
                color: 'var(--success)',
                fontSize: '0.85rem',
                background: 'var(--success-glow)',
                border: '1px solid var(--success)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} />
                  <span>Withdrawal successful.</span>
                </div>
                {txHash && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    TX: {txHash.substring(0, 16)}...
                  </span>
                )}
              </div>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: '100%', padding: '12px' }}
              disabled={balanceXlm <= 0 || !withdrawAmount}
            >
              <Send size={16} style={{ marginRight: '6px' }} /> <span>Refund XLM</span>
            </Button>
          </form>
        </Card>

        {/* Security alert spanning both columns */}
        <Card style={{
          gridColumn: '1 / -1',
          background: 'rgba(239, 68, 68, 0.03)',
          borderColor: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          padding: '20px'
        }}>
          <ShieldAlert size={20} style={{ color: 'var(--error)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Smart Contract Auditing</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              All deposits and withdrawals are recorded on the Stellar Testnet ledger. Discrepancies are logged in disputes automatically.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
