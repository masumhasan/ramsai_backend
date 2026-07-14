import { Router } from 'express';
import multer from 'multer';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/food-scan', authenticate, upload.single('image'), AIController.analyzeFood);
router.post('/workout-plan', authenticate, AIController.generateWorkoutPlan);
router.post('/analyze-nutrition', authenticate, upload.single('image'), AIController.analyzeMacros);
router.post('/analyze-burn', authenticate, AIController.analyzeBurn);
router.post('/scan-product', authenticate, AIController.scanProduct);
router.post('/scan-label', authenticate, upload.single('image'), AIController.scanLabel);

export default router;
