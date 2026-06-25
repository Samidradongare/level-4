import React, { createContext, useContext, useState, useEffect } from 'react';
import { freighterWallet } from '../services/freighter';
import { api } from '../services/api';

export interface User {
  id: string;
  wallet_address: string;
  username: string;
  email: string | null;
  profile_picture_url: string | null;
  auto_topup_enabled: boolean;
  auto_topup_threshold: string;
  auto_topup_amount: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isSimulatedWallet: boolean;
  connectWallet: () => Promise<void>;
  disconnect: () => Promise<void>;
  updateSettings: (enabled: boolean, threshold: number, amount: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulatedWallet, setIsSimulatedWallet] = useState<boolean>(false);

  useEffect(() => {
    // Load stored session on initialization
    const storedToken = localStorage.getItem('usagepay_token');
    const storedUser = localStorage.getItem('usagepay_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsSimulatedWallet(!freighterWallet.isExtensionAvailable());
    setLoading(false);
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    try {
      // 1. Retrieve Wallet address from Freighter
      const address = await freighterWallet.getAddress();
      
      // 2. Request a signin signature
      const timestamp = Math.floor(Date.now() / 1000);
      const message = `UsagePay Authorization request:\nWallet: ${address}\nTimestamp: ${timestamp}`;
      const signature = await freighterWallet.signLoginMessage(message, address);

      // 3. Authenticate with backend API
      const response = await api.post('/auth/signin', {
        wallet_address: address,
        message,
        signature,
      });

      const { token: jwtToken, user: userProfile } = response.data.data;

      // 4. Save credentials
      localStorage.setItem('usagepay_token', jwtToken);
      localStorage.setItem('usagepay_user', JSON.stringify(userProfile));
      
      setToken(jwtToken);
      setUser(userProfile);
      setIsSimulatedWallet(!freighterWallet.isExtensionAvailable());
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      throw new Error(error.response?.data?.error?.message || error.message || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Proceed with local logout regardless of API failure
    } finally {
      localStorage.removeItem('usagepay_token');
      localStorage.removeItem('usagepay_user');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const updateSettings = async (enabled: boolean, threshold: number, amount: number) => {
    try {
      const response = await api.post('/user/settings/auto-topup', {
        enabled,
        threshold,
        amount,
      });
      const updatedUser = response.data.data;
      localStorage.setItem('usagepay_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to update settings');
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      const freshUser = response.data.data;
      localStorage.setItem('usagepay_user', JSON.stringify(freshUser));
      setUser(freshUser);
    } catch (e) {
      console.error('Profile refresh failed', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isSimulatedWallet,
        connectWallet,
        disconnect,
        updateSettings,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
