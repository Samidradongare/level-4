import * as db from '../config/database';
import { logger } from '../utils/logger';
import { COST_PER_SUMMARY_STROOPS } from '../config/stellar';

export interface UsageStats {
  totalCalls: number;
  totalSpentStroops: number;
  byAction: Record<string, number>;
}

export class MeteringService {
  /**
   * Log an API action in the off-chain Postgres database
   */
  async logUsage(
    userId: string,
    serviceId: string,
    actionType: string,
    metadata: object,
    costStroops: number
  ): Promise<any> {
    try {
      const res = await db.query(
        `INSERT INTO usage_logs (user_id, service_id, action_type, api_call_count, cost_stroops, metadata)
         VALUES ($1, $2, $3, 1, $4, $5)
         RETURNING *`,
        [userId, serviceId, actionType, costStroops, JSON.stringify(metadata)]
      );
      logger.info(`Logged usage for user ${userId}: ${actionType} costing ${costStroops} stroops.`);
      return res.rows[0];
    } catch (error: any) {
      logger.error(`Failed to log usage: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieve usage metrics for a user over a date range
   */
  async getUsageStats(userId: string, days: number = 30): Promise<UsageStats> {
    try {
      // In-memory mock DB queries if SQL failed
      if (db.isMockDb()) {
        const logs = db.mockDbStore.usageLogs.filter(
          l => l.user_id === userId &&
          l.created_at >= new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        );
        const stats: UsageStats = {
          totalCalls: logs.length,
          totalSpentStroops: logs.reduce((sum, l) => sum + Number(l.cost_stroops), 0),
          byAction: {}
        };
        logs.forEach(l => {
          stats.byAction[l.action_type] = (stats.byAction[l.action_type] || 0) + 1;
        });
        return stats;
      }

      const res = await db.query(
        `SELECT action_type, COUNT(*) as call_count, SUM(cost_stroops) as total_cost
         FROM usage_logs
         WHERE user_id = $1 AND created_at >= NOW() - $2 * INTERVAL '1 day'
         GROUP BY action_type`,
        [userId, days]
      );

      const stats: UsageStats = {
        totalCalls: 0,
        totalSpentStroops: 0,
        byAction: {}
      };

      res.rows.forEach((row: any) => {
        const count = parseInt(row.call_count, 10);
        const cost = parseInt(row.total_cost, 10);
        stats.totalCalls += count;
        stats.totalSpentStroops += cost;
        stats.byAction[row.action_type] = count;
      });

      return stats;
    } catch (error: any) {
      logger.error(`Failed to get usage stats: ${error.message}`);
      return { totalCalls: 0, totalSpentStroops: 0, byAction: {} };
    }
  }

  /**
   * Calculate action cost (returning amount in stroops)
   */
  calculateCost(actionType: string, metadata: any = {}): number {
    if (actionType === 'smartnotes/generate' || actionType === 'generate_summary') {
      const charCount = metadata.charCount || 0;
      // Extra charge of 100 stroops per 1000 characters processed
      const baseCost = COST_PER_SUMMARY_STROOPS;
      const variableCost = Math.floor(charCount / 1000) * 100;
      return baseCost + variableCost;
    }
    return 1000000; // Default 0.1 XLM (1,000,000 stroops)
  }
}

export const meteringService = new MeteringService();
