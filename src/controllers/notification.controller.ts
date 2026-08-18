import { Request, Response } from 'express';
import { Notification } from '../models/notification.model';
import User from '../models/user.model';
import FcmToken from '../models/fcmToken.model';
import { getFirebaseMessaging } from '../config/firebase.config';

const SEED_NOTIFICATIONS = [
  {
    title: 'Welcome to GoCal AI! 🚀',
    message: 'Your personal AI nutrition & workout assistant is ready to help you hit your fitness targets.',
    type: 'system',
    isRead: false,
  },
  {
    title: 'Daily Streak Milestone 🔥',
    message: 'Awesome job logging your meals! You are building great healthy habits.',
    type: 'achievement',
    isRead: false,
  },
  {
    title: 'Workout Reminder 🏋️‍♂️',
    message: 'Time for your daily Full Body Flexibility routine. Keep pushing forward!',
    type: 'workout',
    isRead: false,
  },
  {
    title: 'Calorie Target Alert 🥗',
    message: 'You have consumed 75 kcal today. Check your remaining protein & carb goals.',
    type: 'nutrition',
    isRead: false,
  },
  {
    title: 'Stay Hydrated 💧',
    message: 'Remember to drink at least 8 glasses of water today for optimal performance.',
    type: 'reminder',
    isRead: true,
  },
  {
    title: 'AI Food Scanner Update 📸',
    message: 'Snap a photo of your lunch to instantly analyze calories, macros, and nutrients.',
    type: 'nutrition',
    isRead: true,
  },
  {
    title: 'Membership Benefits ⭐️',
    message: 'Your active plan gives you daily AI food scans and custom workout generation.',
    type: 'subscription',
    isRead: true,
  },
  {
    title: 'New Feature Announcement ✨',
    message: 'Check out the upgraded Legal & Privacy policy manager in your settings menu.',
    type: 'system',
    isRead: true,
  },
  {
    title: 'Weekly Summary Available 📊',
    message: 'Your weekly fitness report is ready. View your progress trends in the Progress tab.',
    type: 'achievement',
    isRead: true,
  },
  {
    title: 'Evening Warmdown Exercise 🧘',
    message: 'Relax your body with a 5-minute light stretching routine before sleep.',
    type: 'workout',
    isRead: true,
  },
  {
    title: 'Barcode Scanning Tip 🔍',
    message: 'Scanning packaged products gives instant ingredient breakdowns and nutrition facts.',
    type: 'nutrition',
    isRead: true,
  },
  {
    title: 'Profile Updated ✅',
    message: 'Your health targets and daily calorie goals were successfully synchronized.',
    type: 'system',
    isRead: true,
  },
];

/**
 * Get user notifications (paginated 10 at a time)
 */
export const getUserNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId || (req as any).user?._id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized user' });
      return;
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    let total = await Notification.countDocuments({ userId });

    // Seed default notifications for user if empty
    if (total === 0) {
      const docsToInsert = SEED_NOTIFICATIONS.map((n, idx) => ({
        ...n,
        userId,
        createdAt: new Date(Date.now() - idx * 3600 * 1000 * 4),
      }));
      await Notification.insertMany(docsToInsert);
      total = await Notification.countDocuments({ userId });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
};

/**
 * Mark single notification as read
 */
export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId || (req as any).user?._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification, unreadCount },
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification', error: error.message });
  }
};

/**
 * Mark all notifications for user as read
 */
export const markAllNotificationsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId || (req as any).user?._id;

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: { unreadCount: 0 },
    });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to update notifications', error: error.message });
  }
};

/**
 * Delete a single notification for user
 */
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId || (req as any).user?._id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized user' });
      return;
    }

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
      data: { id, unreadCount },
    });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification', error: error.message });
  }
};

/**
 * Clear all notifications for user
 */
export const clearAllNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId || (req as any).user?._id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized user' });
      return;
    }

    await Notification.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: 'All notifications cleared successfully',
      data: { unreadCount: 0 },
    });
  } catch (error: any) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to clear notifications', error: error.message });
  }
};

/**
 * Create a user reminder/system notification (e.g. Drink Water, Meal Log, Workout)
 */
export const createUserNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId || (req as any).user?._id;
    const { title, message, type } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized user' });
      return;
    }

    if (!title || !message) {
      res.status(400).json({ success: false, message: 'Title and message are required' });
      return;
    }

    // Check if duplicate notification already created today for this user & title
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await Notification.findOne({
      userId,
      title: title.trim(),
      createdAt: { $gte: startOfDay },
    });

    if (existing) {
      res.status(200).json({
        success: true,
        message: 'Notification already exists for today',
        data: existing,
      });
      return;
    }

    const notification = new Notification({
      userId,
      title: title.trim(),
      message: message.trim(),
      type: type || 'reminder',
      isRead: false,
    });

    await notification.save();

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification, unreadCount },
    });
  } catch (error: any) {
    console.error('Error creating user notification:', error);
    res.status(500).json({ success: false, message: 'Failed to create notification', error: error.message });
  }
};

/**
 * Register or update user FCM device token
 */
export const registerFcmToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId || (req as any).user?._id;
    const { token, deviceType } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized user' });
      return;
    }

    if (!token || typeof token !== 'string') {
      res.status(400).json({ success: false, message: 'FCM token is required' });
      return;
    }

    const fcmRecord = await FcmToken.findOneAndUpdate(
      { token: token.trim() },
      {
        userId,
        token: token.trim(),
        deviceType: deviceType || 'android',
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'FCM token registered successfully',
      data: fcmRecord,
    });
  } catch (error: any) {
    console.error('Error registering FCM token:', error);
    res.status(500).json({ success: false, message: 'Failed to register FCM token', error: error.message });
  }
};

/**
 * Delete FCM device token (e.g. on logout)
 */
export const removeFcmToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId || (req as any).user?._id;
    const { token } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized user' });
      return;
    }

    if (!token) {
      await FcmToken.deleteMany({ userId });
    } else {
      await FcmToken.deleteOne({ userId, token: token.trim() });
    }

    res.status(200).json({
      success: true,
      message: 'FCM token(s) removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ success: false, message: 'Failed to remove FCM token', error: error.message });
  }
};

/**
 * Update user notification preferences
 */
export const updateNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId || (req as any).user?._id;
    const { preferences } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized user' });
      return;
    }

    if (!preferences || typeof preferences !== 'object') {
      res.status(400).json({ success: false, message: 'Notification preferences object is required' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...preferences,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: user.notificationPreferences,
    });
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ success: false, message: 'Failed to update preferences', error: error.message });
  }
};

/**
 * Admin: Broadcast notification to ALL users (Title, Message, Image) with FCM Push Notifications
 */
export const broadcastNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message, imageUrl, type = 'broadcast' } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ success: false, message: 'Notification title is required.' });
      return;
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ success: false, message: 'Notification message is required.' });
      return;
    }

    // Find all active users who have broadcast and master notifications enabled
    const eligibleUsers = await User.find({
      isBanned: { $ne: true },
      'notificationPreferences.master': { $ne: false },
      'notificationPreferences.broadcast': { $ne: false },
    }).select('_id');

    const eligibleUserIds = eligibleUsers.map((u: any) => u._id);

    if (eligibleUserIds.length === 0) {
      res.status(400).json({ success: false, message: 'No eligible registered users found for broadcast.' });
      return;
    }

    const now = new Date();
    const notificationsToInsert = eligibleUserIds.map((uId: any) => ({
      userId: uId,
      title: title.trim(),
      message: message.trim(),
      imageUrl: imageUrl && typeof imageUrl === 'string' ? imageUrl.trim() : undefined,
      type: type || 'broadcast',
      isRead: false,
      isBroadcast: true,
      createdAt: now,
    }));

    await Notification.insertMany(notificationsToInsert);

    // Send FCM Push Notifications via Firebase Admin SDK
    let pushSuccessCount = 0;
    const messaging = getFirebaseMessaging();

    if (messaging && eligibleUserIds.length > 0) {
      const fcmTokens = await FcmToken.find({ userId: { $in: eligibleUserIds } }).select('token');
      const tokens = fcmTokens.map((t: any) => t.token).filter(Boolean);

      if (tokens.length > 0) {
        const batchSize = 500;
        for (let i = 0; i < tokens.length; i += batchSize) {
          const batchTokens = tokens.slice(i, i + batchSize);
          try {
            const response = await messaging.sendEachForMulticast({
              tokens: batchTokens,
              notification: {
                title: title.trim(),
                body: message.trim(),
                ...(imageUrl ? { imageUrl: imageUrl.trim() } : {}),
              },
              data: {
                type: type || 'broadcast',
                title: title.trim(),
                message: message.trim(),
                ...(imageUrl ? { imageUrl: imageUrl.trim() } : {}),
              },
              android: {
                priority: 'high',
                notification: {
                  channelId: 'broadcast_reminders',
                  priority: 'high',
                  sound: 'default',
                },
              },
              apns: {
                payload: {
                  aps: {
                    alert: {
                      title: title.trim(),
                      body: message.trim(),
                    },
                    sound: 'default',
                    badge: 1,
                  },
                },
              },
            });

            pushSuccessCount += response.successCount;

            // Remove invalid/stale tokens
            const staleTokens: string[] = [];
            response.responses.forEach((resp: any, idx: number) => {
              if (!resp.success && resp.error) {
                const errorCode = resp.error.code;
                if (
                  errorCode === 'messaging/invalid-registration-token' ||
                  errorCode === 'messaging/registration-token-not-registered'
                ) {
                  staleTokens.push(batchTokens[idx]);
                }
              }
            });

            if (staleTokens.length > 0) {
              await FcmToken.deleteMany({ token: { $in: staleTokens } });
            }
          } catch (fcmError: any) {
            console.error('[FCM ERROR] Multicast send failed:', fcmError);
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Broadcast notification successfully dispatched to ${eligibleUserIds.length} users (${pushSuccessCount} push notifications sent)!`,
      data: {
        recipientsCount: eligibleUserIds.length,
        pushSuccessCount,
        title,
        message,
        imageUrl,
        sentAt: now,
      },
    });
  } catch (error: any) {
    console.error('Error sending notification broadcast:', error);
    res.status(500).json({ success: false, message: 'Failed to broadcast notification', error: error.message });
  }
};

/**
 * Admin: Get past broadcast history logs
 */
export const getBroadcastHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const history = await Notification.aggregate([
      { $match: { isBroadcast: true } },
      {
        $group: {
          _id: {
            title: '$title',
            message: '$message',
            imageUrl: '$imageUrl',
            createdAt: '$createdAt',
          },
          recipientsCount: { $sum: 1 },
          sentAt: { $first: '$createdAt' },
        },
      },
      { $sort: { sentAt: -1 } },
      { $limit: 20 },
      {
        $project: {
          _id: 0,
          title: '$_id.title',
          message: '$_id.message',
          imageUrl: '$_id.imageUrl',
          sentAt: 1,
          recipientsCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error('Error fetching broadcast history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch broadcast history', error: error.message });
  }
};
