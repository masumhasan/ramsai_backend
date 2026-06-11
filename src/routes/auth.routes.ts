import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/register', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.sendOtp);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/reset-password', AuthController.resetPassword);

export default router;
