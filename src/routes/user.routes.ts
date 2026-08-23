import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, UserController.updateProfile);
router.post('/feedback', authenticate, UserController.submitFeedback);
router.delete('/profile', authenticate, UserController.deleteAccount);

export default router;
