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

/**
 * @route   POST /api/ai/workout-plan
 * @desc    Generate a weekly workout plan
 * @access  Public
 */
router.post('/workout-plan', AIController.generateWorkoutPlan);

/**
 * @route   POST /api/ai/analyze-nutrition
 * @desc    Get nutrition breakdown of a food image
 * @access  Public
 */
router.post('/analyze-nutrition', upload.single('image'), AIController.analyzeMacros);

export default router;
