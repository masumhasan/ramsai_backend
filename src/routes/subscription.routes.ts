import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public / Authenticated plans listing
router.get('/plans', SubscriptionController.getPlans);

// Authenticated user subscription endpoints
router.post('/select', authenticate, SubscriptionController.selectPlan);
router.get('/my-subscription', authenticate, SubscriptionController.getMySubscription);

// RevenueCat Webhook (Public route, authentication verified inside handler)
router.post('/webhook', SubscriptionController.handleRevenueCatWebhook);

export default router;
