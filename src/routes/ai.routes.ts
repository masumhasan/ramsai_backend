import { Router } from 'express';
import multer from 'multer';
import { AIController } from '../controllers/ai.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route   POST /api/ai/food-scan
 * @desc    Analyze food image for ingredients and macros
 * @access  Public (should be protected in production)
 */
router.post('/food-scan', upload.single('image'), AIController.analyzeFood);

import { authenticate } from '../middleware/auth.middleware';

router.post('/workout-plan', authenticate, AIController.generateWorkoutPlan);

router.post('/analyze-nutrition', upload.single('image'), AIController.analyzeMacros);

/**
 * @route   POST /api/ai/analyze-burn
 * @desc    Analyze activity description for calories burned
 * @access  Public
 */
router.post('/analyze-burn', AIController.analyzeBurn);

export default router;
