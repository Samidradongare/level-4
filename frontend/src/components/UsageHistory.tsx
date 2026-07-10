import React from 'react';
import { TransactionRecord } from '../hooks/useAnalytics';
import { ExternalLink, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from './Badge';
import { Table } from './Table';


interface UsageHistoryProps {
  transactions: TransactionRecord[];
  loading: boolean;
}

export const UsageHistory: React.FC<UsageHistoryProps> = ({ transactions, loading }) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <Badge type="success" style={{ gap: '4px' }}>
            <CheckCircle size={10} />
            <span>Success</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge type="warning" style={{ gap: '4px' }}>
            <Clock size={10} />
            <span>Pending</span>
          </Badge>
        );
      case 'failed':
      case 'rejected':
        return (
          <Badge type="error" style={{ gap: '4px' }}>
            <AlertTriangle size={10} />
            <span>Failed</span>
          </Badge>
        );
      default:
        return <Badge type="warning">{status}</Badge>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', width: '100%' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', fontWeight: 600 }}>Transaction History</h3>

      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading transaction feed...
        </div>
      ) : transactions.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          No ledger transactions recorded yet. Fund your escrow or write notes to begin!
        </div>
      ) : (
        <Table
          headers={['Date & Time', 'Action', 'Amount (XLM)', 'Status', 'Explorer Hash']}
          containerStyle={{ margin: 0, padding: 0 }}
        >
          {transactions.map((tx) => {
            const isDeposit = tx.service_id === 'ESCROW_CONTRACT';
            const cost = parseInt(tx.amount_stroops) / 10000000;
            
            return (
              <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background-color 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ textAlign: 'left', padding: '16px', whiteSpace: 'nowrap', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {tx.created_at ? new Date(tx.created_at).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : 'N/A'}
                </td>
                <td style={{ textAlign: 'left', padding: '16px' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {isDeposit ? 'Escrow Funding' : 'AI Summary'}
                  </span>
                </td>
                <td style={{ textAlign: 'right', padding: '16px', color: isDeposit ? 'var(--success)' : 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'var(--font-display)' }}>
                  {isDeposit ? `+${cost.toFixed(2)}` : `-${cost.toFixed(3)}`}
                </td>
                <td style={{ textAlign: 'center', padding: '16px' }}>
                  {getStatusBadge(tx.status)}
                </td>
                <td style={{ textAlign: 'right', padding: '16px' }}>
                  {tx.tx_hash ? (
                    <a 
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        padding: '6px 12px',
                        background: 'var(--primary-glow)',
                        borderRadius: '12px',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}
                    >
                      <span>{tx.tx_hash.substring(0, 8)}...</span>
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </div>
  );
};
export default UsageHistory;
