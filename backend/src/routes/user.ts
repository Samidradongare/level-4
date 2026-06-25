import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/profile', verifyToken, UserController.getProfile);
router.get('/balance', verifyToken, UserController.getBalance);
router.post('/settings/auto-topup', verifyToken, UserController.updateAutoTopupSettings);
router.post('/fund', verifyToken, UserController.fundAccount);
router.post('/withdraw', verifyToken, UserController.withdrawAccount);

export default router;
