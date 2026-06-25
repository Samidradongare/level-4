import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Landmark, ArrowRight, ExternalLink } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface FundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const FundModal: React.FC<FundModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState<string>('10');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Please enter a valid amount greater than zero.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessTxHash(null);

    try {
      // Calls user fund handler on backend (simulates/submits funding transaction)
      const response = await api.post('/user/fund', {
        amount_xlm: val
      });

      setSuccessTxHash(response.data.data.tx_hash);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Funding transaction failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectQuickAmount = (val: string) => {
    setAmount(val);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(5, 8, 22, 0.7)',
      backdropFilter: 'blur(8px)',
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '28px',
        position: 'relative',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
        }}>
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Landmark size={22} style={{ color: 'var(--primary)' }} />
          <span>Fund Escrow Account</span>
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Deposit Stellar XLM from your Freighter wallet into the UsagePay smart contract escrow.
        </p>

        {successTxHash ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <span style={{ fontSize: '2.5rem', color: 'var(--success)' }}>⚡</span>
            <h4 style={{ margin: '12px 0 6px' }}>Deposit Successful!</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Your contract balance has been updated.
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '24px',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              overflowWrap: 'anywhere',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>TX HASH:</span>
              <a 
                href={`https://stellar.expert/explorer/testnet/tx/${successTxHash}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <span>{successTxHash.substring(0, 16)}...</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%' }}>
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Deposit Amount (XLM)</label>
              <input 
                type="number" 
                className="form-input" 
                step="any"
                min="0.0000001"
                placeholder="10.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Quick selectors */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {['5', '10', '25', '50'].map(val => (
                <button 
                  key={val} 
                  type="button" 
                  className={`btn btn-secondary`} 
                  onClick={() => selectQuickAmount(val)}
                  style={{ flex: 1, padding: '8px' }}
                  disabled={loading}
                >
                  {val} XLM
                </button>
              ))}
            </div>

            {errorMsg && (
              <div style={{
                color: 'var(--error)',
                fontSize: '0.8rem',
                background: 'var(--error-glow)',
                border: '1px solid var(--error)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
                textAlign: 'center',
              }}>
                {errorMsg}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px' }}
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="sm" label="Submitting..." />
              ) : (
                <>
                  <span>Sign & Deposit</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default FundModal;
