import { Pool } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

let dbPool: Pool | null = null;
let useMockDb = false;

// Simulated in-memory database store as fallback
export const mockDbStore: {
  users: any[];
  usageLogs: any[];
  transactions: any[];
  disputes: any[];
  analytics: any[];
} = {
  users: [],
  usageLogs: [],
  transactions: [],
  disputes: [],
  analytics: [],
};

const tablesSchema = `
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(56) UNIQUE NOT NULL,
    username VARCHAR(100),
    email VARCHAR(100),
    profile_picture_url VARCHAR(500),
    auto_topup_enabled BOOLEAN DEFAULT false,
    auto_topup_threshold BIGINT DEFAULT 1000000,
    auto_topup_amount BIGINT DEFAULT 5000000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
  );

  CREATE INDEX IF NOT EXISTS idx_wallet_address ON users(wallet_address);

  CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_id VARCHAR(56),
    action_type VARCHAR(100),
    api_call_count INT DEFAULT 1,
    data_processed_kb INT,
    cost_stroops BIGINT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_user_id ON usage_logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_service_id ON usage_logs(service_id);
  CREATE INDEX IF NOT EXISTS idx_created_at ON usage_logs(created_at);

  CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_id VARCHAR(56),
    amount_stroops BIGINT NOT NULL,
    status VARCHAR(50),
    tx_hash VARCHAR(256),
    soroban_tx_id BIGINT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_user_id_transactions ON transactions(user_id);
  CREATE INDEX IF NOT EXISTS idx_status ON transactions(status);
  CREATE INDEX IF NOT EXISTS idx_tx_hash ON transactions(tx_hash);

  CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    claimed_amount_stroops BIGINT,
    actual_amount_stroops BIGINT,
    discrepancy_stroops BIGINT,
    reason TEXT,
    status VARCHAR(50),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_user_id_disputes ON disputes(user_id);
  CREATE INDEX IF NOT EXISTS idx_status_disputes ON disputes(status);

  CREATE TABLE IF NOT EXISTS daily_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_users INT,
    active_users INT,
    total_transactions INT,
    total_volume_stroops BIGINT,
    avg_transaction_stroops BIGINT,
    disputes_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

export async function initDatabase(): Promise<void> {
  try {
    dbPool = new Pool({
      connectionString: env.DATABASE_URL,
      max: env.DB_POOL_SIZE,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Check connection
    const client = await dbPool.connect();
    logger.info('Connected to PostgreSQL database successfully.');
    
    // Execute tables creation schema
    await client.query(tablesSchema);
    logger.info('Database schema tables verified/created successfully.');
    client.release();
  } catch (error: any) {
    logger.warn(`PostgreSQL initialization failed: ${error.message}`);
    logger.warn('FALLING BACK TO MEMORY-BASED SIMULATED DATA STORE. Note: Data will not persist across restarts.');
    useMockDb = true;
    dbPool = null;
  }
}

export async function query(text: string, params?: any[]): Promise<any> {
  if (useMockDb || !dbPool) {
    return handleMockQuery(text, params);
  }
  return dbPool.query(text, params);
}

export function isMockDb(): boolean {
  return useMockDb;
}

// Basic simulated queries in-memory parser
function handleMockQuery(text: string, params?: any[]): any {
  const queryStr = text.toLowerCase().replace(/\s+/g, ' ');
  const p = params || [];

  // Mock User Creation / Fetching
  if (queryStr.includes('select * from users where wallet_address =')) {
    const addr = p[0];
    const user = mockDbStore.users.find(u => u.wallet_address === addr);
    return { rows: user ? [user] : [] };
  }

  if (queryStr.includes('insert into users') && queryStr.includes('wallet_address')) {
    const id = crypto.randomUUID();
    const newUser = {
      id,
      wallet_address: p[0],
      username: p[1] || 'StellarUser',
      email: p[2] || '',
      profile_picture_url: p[3] || '',
      auto_topup_enabled: false,
      auto_topup_threshold: 1000000,
      auto_topup_amount: 5000000,
      created_at: new Date(),
      updated_at: new Date(),
      last_active_at: new Date(),
      is_active: true
    };
    mockDbStore.users.push(newUser);
    return { rows: [newUser] };
  }

  if (queryStr.includes('update users set auto_topup_enabled =')) {
    const enabled = p[0];
    const threshold = p[1];
    const amount = p[2];
    const wallet = p[3];
    const userIndex = mockDbStore.users.findIndex(u => u.wallet_address === wallet);
    if (userIndex !== -1) {
      mockDbStore.users[userIndex].auto_topup_enabled = enabled;
      mockDbStore.users[userIndex].auto_topup_threshold = threshold;
      mockDbStore.users[userIndex].auto_topup_amount = amount;
      mockDbStore.users[userIndex].updated_at = new Date();
      return { rows: [mockDbStore.users[userIndex]] };
    }
    return { rows: [] };
  }

  if (queryStr.includes('select * from users where id =')) {
    const id = p[0];
    const user = mockDbStore.users.find(u => u.id === id);
    return { rows: user ? [user] : [] };
  }

  // Mock Usage Logs
  if (queryStr.includes('insert into usage_logs')) {
    const newLog = {
      id: crypto.randomUUID(),
      user_id: p[0],
      service_id: p[1],
      action_type: p[2],
      api_call_count: p[3],
      data_processed_kb: p[4],
      cost_stroops: p[5],
      metadata: p[6],
      created_at: new Date()
    };
    mockDbStore.usageLogs.push(newLog);
    return { rows: [newLog] };
  }

  if (queryStr.includes('select * from usage_logs where user_id =')) {
    const userId = p[0];
    const logs = mockDbStore.usageLogs.filter(l => l.user_id === userId);
    return { rows: logs };
  }

  // Mock Transactions
  if (queryStr.includes('insert into transactions')) {
    const newTx = {
      id: crypto.randomUUID(),
      user_id: p[0],
      service_id: p[1],
      amount_stroops: p[2],
      status: p[3],
      tx_hash: p[4],
      soroban_tx_id: p[5],
      error_message: p[6] || null,
      created_at: new Date(),
      completed_at: p[3] === 'completed' ? new Date() : null
    };
    mockDbStore.transactions.push(newTx);
    return { rows: [newTx] };
  }

  if (queryStr.includes('select * from transactions where user_id =')) {
    const userId = p[0];
    const txs = mockDbStore.transactions.filter(t => t.user_id === userId);
    return { rows: txs };
  }

  if (queryStr.includes('select * from transactions') && !queryStr.includes('user_id')) {
    return { rows: mockDbStore.transactions };
  }

  // Mock Disputes
  if (queryStr.includes('insert into disputes')) {
    const newDispute = {
      id: crypto.randomUUID(),
      transaction_id: p[0],
      user_id: p[1],
      claimed_amount_stroops: p[2],
      actual_amount_stroops: p[3],
      discrepancy_stroops: p[4],
      reason: p[5],
      status: p[6],
      created_at: new Date()
    };
    mockDbStore.disputes.push(newDispute);
    return { rows: [newDispute] };
  }

  if (queryStr.includes('select * from disputes')) {
    return { rows: mockDbStore.disputes };
  }

  // Default Fallback
  return { rows: [] };
}
