import { Router } from 'express';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  createUserNotification,
  broadcastNotification,
  getBroadcastHistory,
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// User endpoints
router.get('/', authenticate, getUserNotifications);
router.post('/reminder', authenticate, createUserNotification);
router.patch('/read-all', authenticate, markAllNotificationsRead);
router.patch('/:id/read', authenticate, markNotificationRead);
router.delete('/clear-all', authenticate, clearAllNotifications);
router.delete('/:id', authenticate, deleteNotification);

// Admin Broadcast endpoints
router.post('/broadcast', authenticate, requireAdmin, broadcastNotification);
router.get('/broadcast/history', authenticate, requireAdmin, getBroadcastHistory);

export default router;
