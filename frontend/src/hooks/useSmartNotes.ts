import { useState } from 'react';
import { api } from '../services/api';

export const useSmartNotes = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async (
    notes: string,
    style: string = 'balanced'
  ): Promise<{ summary: string; cost_stroops: string; remaining_balance_stroops: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/usage/smartnotes/generate', {
        notes_text: notes,
        style,
      });
      return response.data.data;
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to generate study summary';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    generateSummary,
    loading,
    error,
  };
};
export default useSmartNotes;
