import React, { useState } from 'react';
import useBalance from '../hooks/useBalance';
import { useAuth } from '../context/AuthContext';
import FundModal from './FundModal';
import WithdrawModal from './WithdrawModal';
import { RefreshCw, PlusCircle, AlertCircle, ArrowDownCircle, CheckCircle2 } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';

export const BalanceCard: React.FC = () => {
  const { isSimulatedWallet } = useAuth();
  const { balanceXlm, loading, refreshBalance } = useBalance();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);

  return (
    <Card title={
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em', margin: 0 }}>
          CONTRACT BALANCE
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {balanceXlm > 0 && (
            <Badge type="success" style={{ gap: '4px' }}>
              <CheckCircle2 size={12} />
              <span>FUNDED</span>
            </Badge>
          )}
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
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    }>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span style={{ 
          fontSize: '3.5rem', 
          fontFamily: 'var(--font-display)', 
          fontWeight: 800,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #ffffff 30%, var(--primary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 4px 20px rgba(59, 130, 246, 0.15)'
        }}>
          {balanceXlm.toFixed(2)}
        </span>
        <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1.25rem' }}>XLM</span>
      </div>

      {isSimulatedWallet && (
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px',
          background: 'var(--primary-glow)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          color: 'var(--primary)',
          alignItems: 'flex-start',
          marginTop: '16px'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>Running in simulation. Deposits are processed instantly using mock test tokens.</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <Button 
          variant="primary" 
          onClick={() => setIsModalOpen(true)}
          style={{ flex: 1, padding: '14px' }}
        >
          <PlusCircle size={18} style={{ marginRight: '6px' }} />
          <span>Fund Escrow</span>
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => setIsWithdrawModalOpen(true)}
          style={{ flex: 1, padding: '14px' }}
        >
          <ArrowDownCircle size={18} style={{ marginRight: '6px' }} />
          <span>Withdraw</span>
        </Button>
      </div>

      <FundModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => refreshBalance()}
      />
      <WithdrawModal 
        isOpen={isWithdrawModalOpen} 
        onClose={() => setIsWithdrawModalOpen(false)} 
        onSuccess={() => refreshBalance()}
      />
    </Card>
  );
};

export default BalanceCard;
