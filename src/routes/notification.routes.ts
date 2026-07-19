import { Router } from 'express';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  broadcastNotification,
  getBroadcastHistory,
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// User endpoints
router.get('/', authenticate, getUserNotifications);
router.patch('/read-all', authenticate, markAllNotificationsRead);
router.patch('/:id/read', authenticate, markNotificationRead);

// Admin Broadcast endpoints
router.post('/broadcast', authenticate, requireAdmin, broadcastNotification);
router.get('/broadcast/history', authenticate, requireAdmin, getBroadcastHistory);

export default router;
