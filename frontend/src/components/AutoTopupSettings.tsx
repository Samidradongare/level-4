import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sliders, Check } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Slider from './Slider';

export const AutoTopupSettings: React.FC = () => {
  const { user, updateSettings } = useAuth();
  
  const [enabled, setEnabled] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(1.0);
  const [amount, setAmount] = useState<number>(5.0);
  
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEnabled(user.auto_topup_enabled);
      setThreshold(parseFloat(user.auto_topup_threshold) / 10000000);
      setAmount(parseFloat(user.auto_topup_amount) / 10000000);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMsg(null);

    if (isNaN(threshold) || threshold < 0 || isNaN(amount) || amount <= 0) {
      setErrorMsg('Threshold must be positive and Top-up amount must be greater than zero.');
      setSaving(false);
      return;
    }

    try {
      const threshStroops = Math.round(threshold * 10000000);
      const amountStroops = Math.round(amount * 10000000);

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
    <Card title={
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sliders size={20} style={{ color: 'var(--primary)' }} />
        <span style={{ fontWeight: 600 }}>Auto-Topup Settings</span>
      </div>
    }>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Toggle Switch */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', display: 'block' }}>Enable Auto-Topup</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automatically fund escrow when balance is low</span>
          </div>
          <label style={{
            position: 'relative',
            display: 'inline-block',
            width: '52px',
            height: '28px',
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
              background: enabled ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              borderRadius: '34px',
              transition: 'var(--transition-fast)',
              boxShadow: enabled ? '0 0 12px var(--primary-glow)' : 'none'
            }} />
            <span style={{
              position: 'absolute',
              content: '""',
              height: '22px',
              width: '22px',
              left: enabled ? '26px' : '3px',
              bottom: '3px',
              background: 'white',
              borderRadius: '50%',
              transition: 'var(--transition-fast)'
            }} />
          </label>
        </div>

        {enabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.2s ease-in' }}>
            <Slider
              label="Threshold Trigger (XLM)"
              min={0}
              max={50}
              step={0.5}
              value={threshold}
              onChange={setThreshold}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '-12px' }}>
              Balances falling below this amount trigger an automatic top-up.
            </span>

            <Slider
              label="Refill Amount (XLM)"
              min={1}
              max={100}
              step={1}
              value={amount}
              onChange={setAmount}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '-12px' }}>
              The amount of XLM to automatically deposit from your wallet.
            </span>
          </div>
        )}

        {errorMsg && (
          <div style={{
            color: 'var(--error)',
            fontSize: '0.85rem',
            background: 'var(--error-glow)',
            border: '1px solid var(--error)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center',
          }}>
            {errorMsg}
          </div>
        )}

        {success && (
          <div style={{
            color: 'var(--success)',
            fontSize: '0.85rem',
            background: 'var(--success-glow)',
            border: '1px solid var(--success)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <Check size={18} />
            <span>Settings saved successfully.</span>
          </div>
        )}

        <Button 
          type="submit" 
          variant="secondary" 
          loading={saving}
          style={{ width: '100%', padding: '14px', marginTop: '4px' }}
        >
          Save Settings
        </Button>
      </form>
    </Card>
  );
};
export default AutoTopupSettings;
