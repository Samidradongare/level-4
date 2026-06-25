import { query, isMockDb } from "../backend/src/config/database";
import { logger } from "../backend/src/utils/logger";

/**
 * Compile transaction summaries and insert/update daily_analytics statistics
 */
async function generateDailyAnalytics(): Promise<any> {
  const today = new Date().toISOString().split("T")[0];

  logger.info(`Running daily analytics task for: ${today}`);

  if (isMockDb()) {
    logger.info("Mock DB active; skipping daily stats compiling on physical tables.");
    return;
  }

  try {
    // 1. Query metrics from transactions
    const stats = await query(`
      SELECT
        COUNT(DISTINCT user_id) as total_users,
        COUNT(DISTINCT CASE WHEN created_at::date = $1 THEN user_id END) as active_today,
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount_stroops), 0) as total_volume,
        COALESCE(AVG(amount_stroops), 0) as avg_transaction,
        COUNT(DISTINCT CASE WHEN status = 'disputed' THEN id END) as disputes_pending
      FROM transactions
      WHERE created_at::date <= $1
    `, [today]);

    const row = stats.rows[0];

    // 2. Insert into daily_analytics
    await query(`
      INSERT INTO daily_analytics (
        date, 
        total_users, 
        active_users, 
        total_transactions, 
        total_volume_stroops, 
        avg_transaction_stroops, 
        disputes_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (date) DO UPDATE SET
        total_users = $2,
        active_users = $3,
        total_transactions = $4,
        total_volume_stroops = $5,
        avg_transaction_stroops = $6,
        disputes_count = $7
    `, [
      today,
      parseInt(row.total_users || "0", 10),
      parseInt(row.active_today || "0", 10),
      parseInt(row.total_transactions || "0", 10),
      Math.round(Number(row.total_volume || 0)),
      Math.round(Number(row.avg_transaction || 0)),
      parseInt(row.disputes_pending || "0", 10),
    ]);

    logger.info("Daily analytics compiles processed successfully.");
    return row;
  } catch (error: any) {
    logger.error(`Failed to compile daily metrics: ${error.message}`);
  }
}

// Automatically runs compilation every hour
setInterval(generateDailyAnalytics, 60 * 60 * 1000);

// Kick off immediately on start
generateDailyAnalytics().catch(err => console.error("Initial analytics compile failed:", err));
