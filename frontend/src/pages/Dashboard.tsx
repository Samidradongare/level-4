import React from 'react';
import { useAuth } from '../context/AuthContext';
import BalanceCard from '../components/BalanceCard';
import AutoTopupSettings from '../components/AutoTopupSettings';
import SmartNotesInterface from '../components/SmartNotesInterface';
import UsageHistory from '../components/UsageHistory';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import useAnalytics from '../hooks/useAnalytics';
import NavBar from '../components/NavBar';

interface DashboardProps {
  onLogout: () => void;
  onNavigateToSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, onNavigateToSettings }) => {
  const { disconnect } = useAuth();
  const { metrics, ledger, loading, refreshAnalytics } = useAnalytics();

  const handleLogoutClick = async () => {
    await disconnect();
    onLogout();
  };

  const handleRefreshAll = () => {
    refreshAnalytics();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Premium Header */}
      <NavBar onNavigateToSettings={onNavigateToSettings} onLogout={handleLogoutClick} />

      {/* Main Grid */}
      <main className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '60px' }}>
        
        {/* Layout Flex Box (2 Columns) */}
        <div className="grid-2col">
          
          {/* Left column: Balance & topup settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <BalanceCard />
            <AutoTopupSettings />
          </div>

          {/* Right column: AI Summarizer & Charts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', minWidth: 0 }}>
            <SmartNotesInterface onSummaryGenerated={handleRefreshAll} />
            <AnalyticsDashboard metrics={metrics} transactions={ledger} loading={loading} />
          </div>
        </div>

        {/* Transaction History ledger grid (Full Width Bottom) */}
        <div>
          <UsageHistory transactions={ledger} loading={loading} />
        </div>
      </main>
    </div>
  );
};
export default Dashboard;
