import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/user-usage', verifyToken, AnalyticsController.getUserUsage);
router.get('/ledger', verifyToken, AnalyticsController.getLedger);
router.get('/dashboard', verifyToken, AnalyticsController.getDashboardData);

export default router;
