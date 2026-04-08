import { Router } from 'express';
import { LogController } from '../controllers/log.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Meal Logs
router.post('/meals', authenticate, LogController.saveMealLog);
router.get('/meals', authenticate, LogController.getMealLogs);

// Workout Logs
router.post('/workouts', authenticate, LogController.saveWorkoutLog);
router.get('/workouts', authenticate, LogController.getWorkoutLogs);

// Burn Logs
router.post('/burns', authenticate, LogController.saveBurnLog);
router.get('/burns', authenticate, LogController.getBurnLogs);

// Workout Plans
router.post('/plans', authenticate, LogController.saveWorkoutPlan);
router.get('/plans', authenticate, LogController.getWorkoutPlans);

export default router;
