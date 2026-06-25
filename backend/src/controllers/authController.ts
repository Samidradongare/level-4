import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { sorobanService } from '../services/sorobanService';
import { verifyFreighterSignature } from '../middleware/auth';
import { isValidStellarAddress } from '../utils/validators';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class AuthController {
  static async signin(req: Request, res: Response): Promise<void> {
    try {
      const { wallet_address, message, signature } = req.body;

      if (!wallet_address || !message || !signature) {
        res.status(400).json({
          success: false,
          error: { message: 'Missing parameters. wallet_address, message, and signature are required.' }
        });
        return;
      }

      if (!isValidStellarAddress(wallet_address)) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid Stellar wallet address format.' }
        });
        return;
      }

      // Verify the cryptographic signature
      const isSignatureValid = verifyFreighterSignature(wallet_address, message, signature);
      if (!isSignatureValid) {
        res.status(401).json({
          success: false,
          error: { message: 'Cryptographic signature verification failed.' }
        });
        return;
      }

      // Check if user exists or register them
      let user = await UserModel.findByWalletAddress(wallet_address);
      if (!user) {
        user = await UserModel.create(wallet_address);
        logger.info(`Registered new user with wallet: ${wallet_address}`);
      }

      // Get current on-chain balance
      const balance = await sorobanService.getBalance(wallet_address);

      // Generate JWT Token
      const token = jwt.sign(
        { id: user.id, wallet_address: user.wallet_address },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            wallet_address: user.wallet_address,
            username: user.username,
            email: user.email,
            profile_picture_url: user.profile_picture_url,
            auto_topup_enabled: user.auto_topup_enabled,
            auto_topup_threshold: user.auto_topup_threshold,
            auto_topup_amount: user.auto_topup_amount,
          },
          balance_stroops: balance.toString()
        }
      });
    } catch (error: any) {
      logger.error(`Signin controller error: ${error.message}`);
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    // Client-side handles deleting the token. We respond success.
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }
}
export default AuthController;
