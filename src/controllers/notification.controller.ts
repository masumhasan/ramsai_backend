import { Request, Response } from 'express';
import { Notification } from '../models/notification.model';
import User from '../models/user.model';

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
    const userId = (req as any).user?._id;

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
    const userId = (req as any).user?._id;
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
    const userId = (req as any).user?._id;

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
 * Admin: Broadcast notification to ALL users (Title, Message, Image)
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

    // Find all users (excluding banned users)
    const users = await User.find({ isBanned: { $ne: true } }).select('_id');

    if (users.length === 0) {
      res.status(400).json({ success: false, message: 'No registered users found to send broadcast.' });
      return;
    }

    const now = new Date();
    const notificationsToInsert = users.map((u: any) => ({
      userId: u._id,
      title: title.trim(),
      message: message.trim(),
      imageUrl: imageUrl && typeof imageUrl === 'string' ? imageUrl.trim() : undefined,
      type: type || 'broadcast',
      isRead: false,
      isBroadcast: true,
      createdAt: now,
    }));

    await Notification.insertMany(notificationsToInsert);

    res.status(200).json({
      success: true,
      message: `Broadcast notification successfully dispatched to ${users.length} users!`,
      data: {
        recipientsCount: users.length,
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
