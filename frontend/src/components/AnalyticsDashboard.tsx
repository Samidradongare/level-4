import React from 'react';
import { UsageMetric, TransactionRecord } from '../hooks/useAnalytics';
import { TrendingUp, BarChart2, Award, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from './Card';

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

  // Format data for Recharts
  const chartData = metrics.map(m => ({
    date: m.date.substring(5), // MM-DD format
    usage: m.usage_count,
    fullDate: m.date
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(5, 8, 22, 0.9)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
        }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>{label}</p>
          <p style={{ margin: 0, color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} />
            {payload[0].value} Requests
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Top Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Card 1 */}
        <Card style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '14px', borderRadius: '14px', background: 'var(--primary-glow)', color: 'var(--primary)', boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Total Volume</h5>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
                {totalSpentXlm.toFixed(2)}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>XLM</span>
            </div>
          </div>
        </Card>

        {/* Card 2 */}
        <Card style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '14px', borderRadius: '14px', background: 'var(--success-glow)', color: 'var(--success)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={24} />
          </div>
          <div>
            <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Avg Charge</h5>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
                {avgTxXlm.toFixed(3)}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: 600 }}>XLM</span>
            </div>
          </div>
        </Card>

        {/* Card 3 */}
        <Card style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.15)', color: 'rgb(167, 139, 250)', boxShadow: '0 0 20px rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} />
          </div>
          <div>
            <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Total Requests</h5>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
                {totalTransactions}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'rgb(167, 139, 250)', fontWeight: 600 }}>Actions</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Usage Chart */}
      <Card title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart2 size={20} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600 }}>AI Note Summarizations by Day</span>
        </div>
      }>
        {loading ? (
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Aggregating usage metrics...
          </div>
        ) : metrics.length === 0 ? (
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            No summary logs logged for the past 7 days.
          </div>
        ) : (
          <div style={{ height: '280px', width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorUsage)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
