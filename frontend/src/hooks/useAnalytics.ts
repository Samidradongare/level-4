import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export interface UsageMetric {
  date: string;
  usage_count: number;
  total_cost: string;
  avg_cost: string;
}

export interface TransactionRecord {
  id: string;
  user_id: string;
  service_id: string;
  amount_stroops: string;
  status: string;
  tx_hash: string | null;
  created_at: string;
  completed_at: string | null;
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<UsageMetric[]>([]);
  const [ledger, setLedger] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, ledgerRes] = await Promise.all([
        api.get(`/analytics/user-usage?user_wallet=${user.wallet_address}&days=7`),
        api.get('/analytics/ledger'),
      ]);
      
      setMetrics(metricsRes.data.data);
      setLedger(ledgerRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [user, fetchAnalytics]);

  return {
    metrics,
    ledger,
    loading,
    error,
    refreshAnalytics: fetchAnalytics,
  };
};
export default useAnalytics;
