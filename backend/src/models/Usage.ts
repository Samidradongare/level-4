import * as db from '../config/database';

export interface UsageLogSchema {
  id: string;
  user_id: string;
  service_id: string;
  action_type: string;
  api_call_count: number;
  data_processed_kb: number | null;
  cost_stroops: string;
  metadata: any;
  created_at: Date;
}

export class UsageModel {
  static async create(
    userId: string,
    serviceId: string,
    actionType: string,
    costStroops: number,
    metadata: any = {}
  ): Promise<UsageLogSchema> {
    const res = await db.query(
      `INSERT INTO usage_logs (user_id, service_id, action_type, cost_stroops, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, serviceId, actionType, costStroops, JSON.stringify(metadata)]
    );
    return res.rows[0];
  }

  static async findByUserId(userId: string, limit: number = 50): Promise<UsageLogSchema[]> {
    const res = await db.query(
      `SELECT * FROM usage_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return res.rows;
  }
}
