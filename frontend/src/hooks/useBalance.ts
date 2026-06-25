import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useBalance = () => {
  const { user } = useAuth();
  const [balanceStroops, setBalanceStroops] = useState<string>('0');
  const [balanceXlm, setBalanceXlm] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async (showLoader = false) => {
    if (!user) return;
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const response = await api.get('/user/balance');
      const data = response.data.data;
      setBalanceStroops(data.balance_stroops);
      setBalanceXlm(data.balance_xlm);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch balance');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [user]);

  // Automated polling updates every 10 seconds
  useEffect(() => {
    if (!user) return;
    fetchBalance(true);

    const interval = setInterval(() => {
      fetchBalance(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [user, fetchBalance]);

  return {
    balanceStroops,
    balanceXlm,
    loading,
    error,
    refreshBalance: () => fetchBalance(true),
  };
};
export default useBalance;
