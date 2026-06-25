import React, { useState } from 'react';
import useBalance from '../hooks/useBalance';
import { useAuth } from '../context/AuthContext';
import FundModal from './FundModal';
import { RefreshCw, PlusCircle, AlertCircle, ArrowUpRight } from 'lucide-react';

export const BalanceCard: React.FC = () => {
  const { user, isSimulatedWallet } = useAuth();
  const { balanceXlm, loading, refreshBalance } = useBalance();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
          CONTRACT BALANCE
        </h4>
        <button 
          onClick={() => refreshBalance()} 
          disabled={loading}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{ 
          fontSize: '2.5rem', 
          fontFamily: 'var(--font-display)', 
          fontWeight: 800,
          background: 'linear-gradient(135deg, #ffffff 40%, var(--primary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {balanceXlm.toFixed(2)}
        </span>
        <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1.1rem' }}>XLM</span>
      </div>

      {/* Auto Topup Status indicator */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '10px 12px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.85rem'
      }}>
        <span style={{ color: 'var(--text-muted)' }}>Auto-Topup:</span>
        {user?.auto_topup_enabled ? (
          <span style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            Enabled ({parseFloat(user.auto_topup_threshold) / 10000000} XLM)
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Disabled</span>
        )}
      </div>

      {isSimulatedWallet && (
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '10px 12px',
          background: 'var(--primary-glow)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          color: 'var(--primary)',
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>Running in simulation. Deposits are processed instantly using mock test tokens.</span>
        </div>
      )}

      <button 
        className="btn btn-primary" 
        onClick={() => setIsModalOpen(true)}
        style={{ width: '100%' }}
      >
        <PlusCircle size={18} />
        <span>Add Funds</span>
      </button>

      <FundModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => refreshBalance()}
      />
    </div>
  );
};
export default BalanceCard;
