import React from 'react';
import { useAuth } from '../context/AuthContext';
import WalletConnect from '../components/WalletConnect';
import { Coins, Zap, ShieldCheck } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import FeatureCard from '../components/FeatureCard';
import Card from '../components/Card';

interface HomeProps {
  onLoginSuccess: () => void;
}

export const Home: React.FC<HomeProps> = ({ onLoginSuccess }) => {
  const { user } = useAuth();

  // If user connects, let them enter the dashboard
  React.useEffect(() => {
    if (user) {
      onLoginSuccess();
    }
  }, [user, onLoginSuccess]);

  return (
    <div className="container fade-in" style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '48px',
      textAlign: 'center',
      paddingTop: '60px',
    }}>
      
      {/* Hero Header */}
      <HeroSection
        tagline="Stellar Soroban Testnet Demo"
        title={
          <>
            Metered Payments for <br />
            <span className="gradient-text">Next-Generation APIs</span>
          </>
        }
        subtitle="Fund your UsagePay smart contract escrow balance, set up automatic top-up thresholds, and pay per-request for AI study summaries instantly using XLM."
      />

      {/* Wallet Connect Onboarding Panel */}
      <Card className="lift-hover" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '36px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }} title="Welcome to UsagePay">
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          To test SmartNotes AI note summarizations and explore analytics, authorize Freighter wallet to sign in.
        </p>
        <WalletConnect />
      </Card>

      {/* Feature Grids */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        maxWidth: '900px',
        width: '100%',
        marginTop: '20px',
      }}>
        <FeatureCard
          icon={<Coins size={20} />}
          title="Escrow pre-funding"
          description="Deposit XLM into a secure escrow on-chain. Services debit only what you request, protecting your primary wallet."
        />

        <FeatureCard
          icon={<Zap size={20} />}
          iconBgColor="var(--success-glow)"
          iconColor="var(--success)"
          title="Auto-Topup Triggers"
          description="Configure automatic threshold limits. If your balance drops below trigger values, it reloads instantly."
        />

        <FeatureCard
          icon={<ShieldCheck size={20} />}
          iconBgColor="var(--error-glow)"
          iconColor="var(--error)"
          title="Off-chain audit sync"
          description="Hourly reconciliation workers compare off-chain server logs against on-chain Soroban events to prevent fraud."
        />
      </div>
    </div>
  );
};

export default Home;
