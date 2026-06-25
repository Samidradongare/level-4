import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

router.post('/signin', AuthController.signin);
router.post('/logout', AuthController.logout);

export default router;
