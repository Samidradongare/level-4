import React from 'react';
import { TransactionRecord } from '../hooks/useAnalytics';
import { ExternalLink, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

interface UsageHistoryProps {
  transactions: TransactionRecord[];
  loading: boolean;
}

export const UsageHistory: React.FC<UsageHistoryProps> = ({ transactions, loading }) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="badge badge-success" style={{ gap: '4px' }}>
            <CheckCircle size={10} />
            <span>Success</span>
          </span>
        );
      case 'pending':
        return (
          <span className="badge badge-warning" style={{ gap: '4px' }}>
            <Clock size={10} />
            <span>Pending</span>
          </span>
        );
      case 'failed':
      case 'rejected':
        return (
          <span className="badge badge-error" style={{ gap: '4px' }}>
            <AlertTriangle size={10} />
            <span>Failed</span>
          </span>
        );
      default:
        return <span className="badge badge-warning">{status}</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', width: '100%' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Transaction History</h3>

      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading transaction feed...
        </div>
      ) : transactions.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No ledger transactions recorded yet. Fund your escrow or write notes to begin!
        </div>
      ) : (
        <div className="table-container">
          <table className="table-glass">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Action</th>
                <th>Cost (XLM)</th>
                <th>Status</th>
                <th>Explorer Hash</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const isDeposit = tx.service_id === 'ESCROW_CONTRACT';
                const cost = parseInt(tx.amount_stroops) / 10000000;
                
                return (
                  <tr key={tx.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>
                        {isDeposit ? 'Escrow Funding' : 'SmartNotes Summary'}
                      </span>
                    </td>
                    <td style={{ color: isDeposit ? 'var(--success)' : 'inherit', fontWeight: 600 }}>
                      {isDeposit ? `+${cost.toFixed(2)}` : `-${cost.toFixed(3)}`}
                    </td>
                    <td>{getStatusBadge(tx.status)}</td>
                    <td>
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
                            gap: '4px',
                          }}
                        >
                          <span>{tx.tx_hash.substring(0, 8)}...</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default UsageHistory;
