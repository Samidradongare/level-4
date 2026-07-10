import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'usagepay_secret_key_2026_dev',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Stellar
  STELLAR_NETWORK: process.env.STELLAR_NETWORK || 'TESTNET',
  SOROBAN_RPC_URL: process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || '',
  SERVICE_WALLET_ADDRESS: process.env.SERVICE_WALLET_ADDRESS || '',
  SERVICE_PRIVATE_KEY: process.env.SERVICE_PRIVATE_KEY || '',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/usagepay',
  DB_POOL_SIZE: parseInt(process.env.DB_POOL_SIZE || '20', 10),

  // API keys
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  FREIGHTER_ALLOWED_ORIGINS: (process.env.FREIGHTER_ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim()),

  // Settings
  COST_PER_SUMMARY_STROOPS: parseInt(process.env.COST_PER_SUMMARY_STROOPS || '5000000', 10),
  AUTO_TOPUP_CHECK_INTERVAL: parseInt(process.env.AUTO_TOPUP_CHECK_INTERVAL || '3600', 10),
  RECONCILIATION_INTERVAL: parseInt(process.env.RECONCILIATION_INTERVAL || '3600', 10),

  // Sentry
  SENTRY_DSN: process.env.SENTRY_DSN || '',
};
