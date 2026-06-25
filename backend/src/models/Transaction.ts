import * as db from '../config/database';

export interface TransactionSchema {
  id: string;
  user_id: string;
  service_id: string;
  amount_stroops: string;
  status: 'pending' | 'completed' | 'failed' | 'disputed';
  tx_hash: string | null;
  soroban_tx_id: string | null;
  error_message: string | null;
  created_at: Date;
  completed_at: Date | null;
}

export class TransactionModel {
  static async create(
    userId: string,
    serviceId: string,
    amountStroops: number,
    status: string,
    txHash?: string,
    sorobanTxId?: string,
    errorMessage?: string
  ): Promise<TransactionSchema> {
    const res = await db.query(
      `INSERT INTO transactions (user_id, service_id, amount_stroops, status, tx_hash, soroban_tx_id, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, serviceId, amountStroops, status, txHash || null, sorobanTxId || null, errorMessage || null]
    );
    return res.rows[0];
  }

  static async findByUserId(userId: string, limit: number = 50): Promise<TransactionSchema[]> {
    const res = await db.query(
      `SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return res.rows;
  }
}
