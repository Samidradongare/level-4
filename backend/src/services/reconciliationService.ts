import * as db from '../config/database';
import { sorobanService } from './sorobanService';
import { logger } from '../utils/logger';

export class ReconciliationService {
  /**
   * Run reconciliation sync between database transactions and on-chain Soroban transactions
   */
  async runHourlyReconciliation(): Promise<void> {
    logger.info('Starting hourly reconciliation job...');
    try {
      // 1. Get all pending or completed transactions from database within the last 2 hours
      const dbTxRes = await db.query(
        `SELECT t.*, u.wallet_address as user_wallet
         FROM transactions t
         JOIN users u ON t.user_id = u.id
         WHERE t.created_at >= NOW() - INTERVAL '2 hours'`
      );
      
      const dbTxs = dbTxRes.rows;
      if (dbTxs.length === 0) {
        logger.info('No recent database transactions found to reconcile.');
        return;
      }

      // Group DB transactions by user to compare with their on-chain history
      const userWallets = Array.from(new Set(dbTxs.map((tx: any) => tx.user_wallet))) as string[];

      for (const wallet of userWallets) {
        logger.info(`Reconciling transactions for wallet: ${wallet}`);
        
        // 2. Fetch on-chain transactions for this user
        const chainTxs = await sorobanService.getTransactionHistory(wallet, 50);
        const userDbTxs = dbTxs.filter((tx: any) => tx.user_wallet === wallet);

        for (const dbTx of userDbTxs) {
          // If the DB transaction has a hash, see if we can find it on-chain
          if (dbTx.tx_hash) {
            const matchedChainTx = chainTxs.find(tx => tx.tx_hash === dbTx.tx_hash);
            
            if (matchedChainTx) {
              // Match found, verify amount
              if (Number(matchedChainTx.amount) !== Number(dbTx.amount_stroops)) {
                logger.warn(`Discrepancy: Transaction ${dbTx.id} amount mismatch. DB: ${dbTx.amount_stroops}, Chain: ${matchedChainTx.amount}`);
                await this.flagDiscrepancy(dbTx, matchedChainTx);
              } else {
                // Amounts match, update status if not completed
                if (dbTx.status !== 'completed') {
                  await db.query(
                    `UPDATE transactions SET status = 'completed', completed_at = NOW() WHERE id = $1`,
                    [dbTx.id]
                  );
                  logger.info(`Transaction ${dbTx.id} successfully matched and marked completed.`);
                }
              }
            } else {
              // DB has transaction hash but it's not found on-chain
              if (dbTx.status === 'completed') {
                logger.warn(`Discrepancy: Transaction ${dbTx.id} marked complete off-chain but not found on-chain.`);
                await this.createDispute(dbTx.id, dbTx.user_id, dbTx.amount_stroops, 0, 'Completed off-chain but missing from Soroban ledger history.');
              }
            }
          }
        }
      }
      
      logger.info('Hourly reconciliation job completed successfully.');
    } catch (error: any) {
      logger.error(`Reconciliation job failed: ${error.message}`);
    }
  }

  private async flagDiscrepancy(dbTx: any, chainTx: any): Promise<void> {
    const discrepancy = BigInt(dbTx.amount_stroops) - BigInt(chainTx.amount);
    await this.createDispute(
      dbTx.id,
      dbTx.user_id,
      BigInt(dbTx.amount_stroops),
      BigInt(chainTx.amount),
      `Amount discrepancy found during reconciliation. Difference: ${discrepancy} stroops.`
    );
  }

  private async createDispute(
    txId: string,
    userId: string,
    claimed: bigint | number,
    actual: bigint | number,
    reason: string
  ): Promise<void> {
    try {
      const claimedStroops = BigInt(claimed);
      const actualStroops = BigInt(actual);
      const discrepancy = claimedStroops - actualStroops;

      // Update tx status
      await db.query(`UPDATE transactions SET status = 'disputed' WHERE id = $1`, [txId]);

      // Log dispute
      await db.query(
        `INSERT INTO disputes (transaction_id, user_id, claimed_amount_stroops, actual_amount_stroops, discrepancy_stroops, reason, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'open')
         ON CONFLICT DO NOTHING`,
        [txId, userId, claimedStroops.toString(), actualStroops.toString(), discrepancy.toString(), reason]
      );
      
      logger.info(`Filed auto-dispute for transaction ${txId}`);
    } catch (error: any) {
      logger.error(`Failed to create dispute record: ${error.message}`);
    }
  }

  /**
   * Resolves an active dispute
   */
  async resolveDispute(disputeId: string, resolution: 'resolved' | 'rejected', notes: string): Promise<void> {
    try {
      await db.query(
        `UPDATE disputes
         SET status = $1, resolution_notes = $2, resolved_at = NOW()
         WHERE id = $3`,
        [resolution, notes, disputeId]
      );
      
      // Update transaction status
      const disputeRes = await db.query(`SELECT transaction_id FROM disputes WHERE id = $1`, [disputeId]);
      if (disputeRes.rows.length > 0) {
        const txId = disputeRes.rows[0].transaction_id;
        await db.query(
          `UPDATE transactions SET status = $1 WHERE id = $2`,
          [resolution === 'resolved' ? 'completed' : 'failed', txId]
        );
      }
      
      logger.info(`Dispute ${disputeId} marked as ${resolution}.`);
    } catch (error: any) {
      logger.error(`Failed to resolve dispute ${disputeId}: ${error.message}`);
      throw error;
    }
  }
}

export const reconciliationService = new ReconciliationService();
