import * as db from '../config/database';

export interface DisputeSchema {
  id: string;
  transaction_id: string;
  user_id: string;
  claimed_amount_stroops: string;
  actual_amount_stroops: string;
  discrepancy_stroops: string;
  reason: string;
  status: 'open' | 'resolved' | 'rejected';
  resolution_notes: string | null;
  created_at: Date;
  resolved_at: Date | null;
}

export class DisputeModel {
  static async create(
    transactionId: string,
    userId: string,
    claimedAmount: number,
    actualAmount: number,
    reason: string
  ): Promise<DisputeSchema> {
    const discrepancy = claimedAmount - actualAmount;
    const res = await db.query(
      `INSERT INTO disputes (transaction_id, user_id, claimed_amount_stroops, actual_amount_stroops, discrepancy_stroops, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'open')
       RETURNING *`,
      [transactionId, userId, claimedAmount, actualAmount, discrepancy, reason]
    );
    return res.rows[0];
  }

  static async findByUserId(userId: string): Promise<DisputeSchema[]> {
    const res = await db.query(
      `SELECT * FROM disputes WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows;
  }
}
