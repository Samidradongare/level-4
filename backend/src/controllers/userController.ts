import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { TransactionModel } from '../models/Transaction';
import { sorobanService } from '../services/sorobanService';
import { isValidNumber } from '../utils/validators';
import { stroopsToXlm } from '../utils/formatters';
import { logger } from '../utils/logger';

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const walletAddress = req.user?.wallet_address;
      if (!walletAddress) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const user = await UserModel.findByWalletAddress(walletAddress);
      if (!user) {
        res.status(404).json({ success: false, error: { message: 'User not found' } });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      logger.error(`getProfile error: ${error.message}`);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async updateAutoTopupSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const walletAddress = req.user?.wallet_address;
      if (!walletAddress) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { enabled, threshold, amount } = req.body;

      if (enabled === undefined || !isValidNumber(threshold) || !isValidNumber(amount)) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid settings. enabled (boolean), threshold (number) and amount (number) are required.' }
        });
        return;
      }

      const updatedUser = await UserModel.updateAutoTopup(
        walletAddress,
        !!enabled,
        Number(threshold),
        Number(amount)
      );

      res.status(200).json({
        success: true,
        data: updatedUser
      });
    } catch (error: any) {
      logger.error(`updateAutoTopupSettings error: ${error.message}`);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async getBalance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const walletAddress = req.user?.wallet_address;
      if (!walletAddress) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const balanceStroops = await sorobanService.getBalance(walletAddress);
      const balanceXlm = stroopsToXlm(balanceStroops);

      res.status(200).json({
        success: true,
        data: {
          balance_stroops: balanceStroops.toString(),
          balance_xlm: balanceXlm
        }
      });
    } catch (error: any) {
      logger.error(`getBalance error: ${error.message}`);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async fundAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const walletAddress = req.user?.wallet_address;
      if (!walletAddress) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { amount_xlm } = req.body;
      if (!isValidNumber(amount_xlm) || Number(amount_xlm) <= 0) {
        res.status(400).json({
          success: false,
          error: { message: 'amount_xlm (number > 0) is required.' }
        });
        return;
      }

      const amountStroops = Math.round(Number(amount_xlm) * 10000000);
      const user = await UserModel.findByWalletAddress(walletAddress);
      if (!user) {
        res.status(404).json({ success: false, error: { message: 'User not found' } });
        return;
      }

      const txHash = `mock_fund_tx_${Math.floor(Math.random() * 9000000 + 1000000)}`;

      // Update balance mock layer
      const currentMockBal = await sorobanService.getBalance(walletAddress);
      sorobanService.setMockBalance(walletAddress, currentMockBal + amountStroops);
      sorobanService.addMockTransaction(walletAddress, 'ESCROW_CONTRACT', amountStroops, 'completed');

      // Record off-chain transaction
      await TransactionModel.create(
        user.id,
        'ESCROW_CONTRACT',
        amountStroops,
        'completed',
        txHash,
        undefined
      );

      res.status(200).json({
        success: true,
        data: {
          tx_hash: txHash,
          amount_stroops: amountStroops
        }
      });
    } catch (error: any) {
      logger.error(`fundAccount error: ${error.message}`);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async withdrawAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const walletAddress = req.user?.wallet_address;
      if (!walletAddress) {
        res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        return;
      }

      const { amount_xlm } = req.body;
      if (!isValidNumber(amount_xlm) || Number(amount_xlm) <= 0) {
        res.status(400).json({
          success: false,
          error: { message: 'amount_xlm (number > 0) is required.' }
        });
        return;
      }

      const amountStroops = Math.round(Number(amount_xlm) * 10000000);
      const user = await UserModel.findByWalletAddress(walletAddress);
      if (!user) {
        res.status(404).json({ success: false, error: { message: 'User not found' } });
        return;
      }

      // Check current contract balance
      const currentMockBal = await sorobanService.getBalance(walletAddress);
      if (currentMockBal < amountStroops) {
        res.status(400).json({
          success: false,
          error: { message: `Insufficient contract balance. Available: ${currentMockBal / 10000000} XLM.` }
        });
        return;
      }

      const txHash = `mock_withdraw_tx_${Math.floor(Math.random() * 9000000 + 1000000)}`;

      // Update balance mock layer
      sorobanService.setMockBalance(walletAddress, currentMockBal - amountStroops);
      sorobanService.addMockTransaction('ESCROW_CONTRACT', walletAddress, amountStroops, 'completed');

      // Record off-chain transaction
      await TransactionModel.create(
        user.id,
        'ESCROW_CONTRACT',
        amountStroops,
        'completed',
        txHash,
        undefined
      );

      res.status(200).json({
        success: true,
        data: {
          tx_hash: txHash,
          amount_stroops: amountStroops
        }
      });
    } catch (error: any) {
      logger.error(`withdrawAccount error: ${error.message}`);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }
}
export default UserController;

