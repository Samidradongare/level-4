import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sliders, RefreshCw, Check, AlertCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export const AutoTopupSettings: React.FC = () => {
  const { user, updateSettings } = useAuth();
  
  const [enabled, setEnabled] = useState<boolean>(false);
  // Values managed in XLM for UI
  const [threshold, setThreshold] = useState<string>('1.0');
  const [amount, setAmount] = useState<string>('5.0');
  
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEnabled(user.auto_topup_enabled);
      // Stroops to XLM conversions (scale 10^7)
      setThreshold((parseFloat(user.auto_topup_threshold) / 10000000).toString());
      setAmount((parseFloat(user.auto_topup_amount) / 10000000).toString());
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMsg(null);

    const threshVal = parseFloat(threshold);
    const amountVal = parseFloat(amount);

    if (isNaN(threshVal) || threshVal < 0 || isNaN(amountVal) || amountVal <= 0) {
      setErrorMsg('Threshold must be positive and Top-up amount must be greater than zero.');
      setSaving(false);
      return;
    }

    try {
      // Convert XLM to Stroops for database storage
      const threshStroops = Math.round(threshVal * 10000000);
      const amountStroops = Math.round(amountVal * 10000000);

      await updateSettings(enabled, threshStroops, amountStroops);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update auto-topup configurations.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sliders size={18} style={{ color: 'var(--primary)' }} />
        <span>Auto-Topup Settings</span>
      </h3>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Toggle Switch */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Enable Auto-Topup</span>
          <label style={{
            position: 'relative',
            display: 'inline-block',
            width: '46px',
            height: '24px',
            cursor: 'pointer',
          }}>
            <input 
              type="checkbox" 
              checked={enabled} 
              onChange={(e) => setEnabled(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }} 
            />
            <span style={{
              position: 'absolute',
              inset: 0,
              background: enabled ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
              borderRadius: '34px',
              transition: 'var(--transition-fast)',
              boxShadow: enabled ? '0 0 10px var(--primary-glow)' : 'none'
            }} />
            <span style={{
              position: 'absolute',
              content: '""',
              height: '18px',
              width: '18px',
              left: enabled ? '24px' : '4px',
              bottom: '3px',
              background: 'white',
              borderRadius: '50%',
              transition: 'var(--transition-fast)'
            }} />
          </label>
        </div>

        {enabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.2s ease-in' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Threshold Trigger (XLM)</label>
              <input 
                type="number" 
                className="form-input" 
                step="any"
                min="0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                disabled={saving}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Balances falling below this trigger amount automatically invoke topup.
              </span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Top-up Fund Value (XLM)</label>
              <input 
                type="number" 
                className="form-input" 
                step="any"
                min="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={saving}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                The amount of XLM to draw from wallet balance when funding.
              </span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div style={{
            color: 'var(--error)',
            fontSize: '0.8rem',
            background: 'var(--error-glow)',
            border: '1px solid var(--error)',
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center',
          }}>
            {errorMsg}
          </div>
        )}

        {success && (
          <div style={{
            color: 'var(--success)',
            fontSize: '0.8rem',
            background: 'var(--success-glow)',
            border: '1px solid var(--success)',
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}>
            <Check size={16} />
            <span>Settings saved successfully.</span>
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-secondary" 
          disabled={saving}
          style={{ width: '100%', marginTop: '8px' }}
        >
          {saving ? (
            <LoadingSpinner size="sm" />
          ) : (
            <span>Save Settings</span>
          )}
        </button>
      </form>
    </div>
  );
};
export default AutoTopupSettings;
