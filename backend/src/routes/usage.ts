import { Router } from 'express';
import { UsageController } from '../controllers/usageController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/smartnotes/generate', verifyToken, UsageController.generateSmartNotesSummary);
router.post('/debit-request', verifyToken, UsageController.debitRequest);

export default router;
