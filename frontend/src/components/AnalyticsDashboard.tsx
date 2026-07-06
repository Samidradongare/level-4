import React from 'react';
import { UsageMetric, TransactionRecord } from '../hooks/useAnalytics';
import { TrendingUp, BarChart2, Award } from 'lucide-react';

interface AnalyticsDashboardProps {
  metrics: UsageMetric[];
  transactions: TransactionRecord[];
  loading: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ metrics, transactions, loading }) => {
  // Aggregate stats
  const totalSpentStroops = transactions
    .filter(t => t.service_id !== 'ESCROW_CONTRACT' && t.status === 'completed')
    .reduce((sum, t) => sum + parseInt(t.amount_stroops), 0);
  
  const totalSpentXlm = totalSpentStroops / 10000000;

  const totalTransactions = transactions.filter(t => t.status === 'completed').length;
  
  const avgTxStroops = totalTransactions > 0 ? Math.round(totalSpentStroops / totalTransactions) : 0;
  const avgTxXlm = avgTxStroops / 10000000;

  // Max value for SVG height calculations
  const maxUsageCount = metrics.length > 0 ? Math.max(...metrics.map(m => m.usage_count), 4) : 4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Top Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Card 1 */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Volume Spent</h5>
            <span style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              {totalSpentXlm.toFixed(2)} XLM
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--success-glow)', color: 'var(--success)' }}>
            <BarChart2 size={22} />
          </div>
          <div>
            <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Average Charge</h5>
            <span style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              {avgTxXlm.toFixed(3)} XLM
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.1)', color: 'rgb(139, 92, 246)' }}>
            <Award size={22} />
          </div>
          <div>
            <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Requests</h5>
            <span style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              {totalTransactions} actions
            </span>
          </div>
        </div>
      </div>

      {/* SVG Usage Chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>AI Note Summarizations by Day</h3>
        
        {loading ? (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Aggregating usage metrics...
          </div>
        ) : metrics.length === 0 ? (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No summary logs logged for the past 7 days.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* SVG Vector Drawing */}
            <svg viewBox="0 0 600 220" style={{ width: '100%', height: 'auto', background: 'transparent' }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="hsla(var(--primary-hue), 100%, 60%, 0.15)" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Grid lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="40" y1="70" x2="580" y2="70" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="40" y1="120" x2="580" y2="120" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="40" y1="170" x2="580" y2="170" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="15" y="24" fill="var(--text-muted)" fontSize="10" fontFamily="monospace">
                {maxUsageCount}
              </text>
              <text x="15" y="98" fill="var(--text-muted)" fontSize="10" fontFamily="monospace">
                {Math.round(maxUsageCount / 2)}
              </text>
              <text x="15" y="174" fill="var(--text-muted)" fontSize="10" fontFamily="monospace">
                0
              </text>

              {/* Render Bars */}
              {metrics.map((m, idx) => {
                const width = 42;
                const spacing = (500 / metrics.length);
                const x = 50 + idx * spacing + (spacing - width) / 2;
                
                const height = maxUsageCount > 0 ? (m.usage_count / maxUsageCount) * 150 : 0;
                const y = 170 - height;
                
                const dateLabel = m.date.substring(5); // MM-DD format

                return (
                  <g key={m.date}>
                    {/* Glowing bar */}
                    <rect 
                      x={x} 
                      y={y} 
                      width={width} 
                      height={Math.max(height, 2)} 
                      fill="url(#barGradient)" 
                      rx="4"
                      filter="url(#glow)"
                      style={{ transition: 'all 0.5s ease' }}
                    />
                    
                    {/* Hover text label */}
                    <text 
                      x={x + width / 2} 
                      y={y - 8} 
                      fill="var(--text-primary)" 
                      fontSize="10" 
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {m.usage_count > 0 ? m.usage_count : ''}
                    </text>

                    {/* Date bottom labels */}
                    <text 
                      x={x + width / 2} 
                      y="190" 
                      fill="var(--text-secondary)" 
                      fontSize="10" 
                      textAnchor="middle"
                    >
                      {dateLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
export default AnalyticsDashboard;
