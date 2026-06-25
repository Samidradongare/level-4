import * as db from '../config/database';

export interface UserSchema {
  id: string;
  wallet_address: string;
  username: string;
  email: string | null;
  profile_picture_url: string | null;
  auto_topup_enabled: boolean;
  auto_topup_threshold: string; // BIGINT as string in Node
  auto_topup_amount: string;    // BIGINT as string in Node
  created_at: Date;
  updated_at: Date;
  last_active_at: Date;
  is_active: boolean;
}

export class UserModel {
  static async findByWalletAddress(walletAddress: string): Promise<UserSchema | null> {
    const res = await db.query(
      'SELECT * FROM users WHERE wallet_address = $1',
      [walletAddress]
    );
    return res.rows.length > 0 ? res.rows[0] : null;
  }

  static async findById(id: string): Promise<UserSchema | null> {
    const res = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return res.rows.length > 0 ? res.rows[0] : null;
  }

  static async create(walletAddress: string, username?: string): Promise<UserSchema> {
    const defaultName = username || `Stellar_${walletAddress.substring(0, 4)}...${walletAddress.substring(52)}`;
    const res = await db.query(
      `INSERT INTO users (wallet_address, username, auto_topup_enabled, auto_topup_threshold, auto_topup_amount)
       VALUES ($1, $2, false, 1000000, 5000000)
       RETURNING *`,
      [walletAddress, defaultName]
    );
    return res.rows[0];
  }

  static async updateAutoTopup(
    walletAddress: string,
    enabled: boolean,
    threshold: number,
    amount: number
  ): Promise<UserSchema | null> {
    const res = await db.query(
      `UPDATE users
       SET auto_topup_enabled = $1, auto_topup_threshold = $2, auto_topup_amount = $3, updated_at = NOW()
       WHERE wallet_address = $4
       RETURNING *`,
      [enabled, threshold, amount, walletAddress]
    );
    return res.rows.length > 0 ? res.rows[0] : null;
  }
}
