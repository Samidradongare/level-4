import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { TransactionModel } from '../models/Transaction';
import { sorobanService } from '../services/sorobanService';
import { aiService } from '../services/aiService';
import { meteringService } from '../services/meteringService';
import { SERVICE_WALLET_ADDRESS } from '../config/stellar';
import { logger } from '../utils/logger';

export class UsageController {
  /**
   * Summarizes notes and bills the user's contract balance
   */
  static async generateSmartNotesSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const walletAddress = req.user?.wallet_address;
      if (!walletAddress) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { notes_text, style = 'balanced' } = req.body;
      if (!notes_text || notes_text.trim().length === 0) {
        res.status(400).json({ success: false, error: { message: 'notes_text is required.' } });
        return;
      }

      // Find user profile
      const user = await UserModel.findByWalletAddress(walletAddress);
      if (!user) {
        res.status(404).json({ success: false, error: { message: 'User account not registered.' } });
        return;
      }

      // Calculate cost in stroops based on character length
      const cost = meteringService.calculateCost('smartnotes/generate', { charCount: notes_text.length });

      // Check current contract balance
      const balance = await sorobanService.getBalance(walletAddress);
      if (balance < cost) {
        res.status(402).json({
          success: false,
          error: {
            message: `Insufficient balance. Summary cost: ${cost} stroops. Current balance: ${balance} stroops.`
          }
        });
        return;
      }

      // Call AI Service first (off-chain)
      logger.info(`Generating summary for ${walletAddress}. Cost: ${cost} stroops.`);
      const summaryText = await aiService.generateSummary(notes_text, style);

      // Perform on-chain Soroban debit
      const debitRes = await sorobanService.debit(walletAddress, SERVICE_WALLET_ADDRESS, cost);
      
      const status = debitRes.success ? 'completed' : 'failed';

      // Log off-chain usage metering log
      if (debitRes.success) {
        await meteringService.logUsage(
          user.id,
          SERVICE_WALLET_ADDRESS,
          'generate_summary',
          { charCount: notes_text.length, style },
          cost
        );
      }

      // Record off-chain transaction
      await TransactionModel.create(
        user.id,
        SERVICE_WALLET_ADDRESS,
        cost,
        status,
        debitRes.txId,
        undefined,
        debitRes.success ? undefined : 'Soroban contract debit transaction failed.'
      );

      if (!debitRes.success) {
        res.status(500).json({
          success: false,
          error: { message: 'On-chain billing transaction failed. Please check wallet funds.' }
        });
        return;
      }

      const newBalance = await sorobanService.getBalance(walletAddress);

      res.status(200).json({
        success: true,
        data: {
          summary: summaryText,
          cost_stroops: cost.toString(),
          remaining_balance_stroops: newBalance.toString()
        }
      });
    } catch (error: any) {
      logger.error(`generateSmartNotesSummary error: ${error.message}`);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  /**
   * Direct billing debit request (alternative service endpoint)
   */
  static async debitRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { user_wallet, amount_stroops, action_type } = req.body;

      if (!user_wallet || !amount_stroops || !action_type) {
        res.status(400).json({
          success: false,
          error: { message: 'Missing parameters. user_wallet, amount_stroops, and action_type are required.' }
        });
        return;
      }

      const user = await UserModel.findByWalletAddress(user_wallet);
      if (!user) {
        res.status(404).json({ success: false, error: { message: 'User not found.' } });
        return;
      }

      const cost = Number(amount_stroops);

      // Perform debit
      const debitRes = await sorobanService.debit(user_wallet, SERVICE_WALLET_ADDRESS, cost);
      
      const status = debitRes.success ? 'completed' : 'failed';

      await TransactionModel.create(
        user.id,
        SERVICE_WALLET_ADDRESS,
        cost,
        status,
        debitRes.txId,
        undefined,
        debitRes.success ? undefined : 'Soroban debit contract call rejected.'
      );

      if (!debitRes.success) {
        res.status(400).json({ success: false, error: { message: 'Debit operation failed. Insufficient balance or missing auth.' } });
        return;
      }

      const newBalance = await sorobanService.getBalance(user_wallet);

      res.status(200).json({
        success: true,
        data: {
          tx_id: debitRes.txId,
          success: true,
          new_balance_stroops: newBalance.toString()
        }
      });
    } catch (error: any) {
      logger.error(`debitRequest error: ${error.message}`);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}
export default UsageController;
