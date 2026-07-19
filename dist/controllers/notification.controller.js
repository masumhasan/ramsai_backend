"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsRead = exports.markNotificationRead = exports.getUserNotifications = void 0;
const notification_model_1 = require("../models/notification.model");
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
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized user' });
            return;
        }
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        let total = await notification_model_1.Notification.countDocuments({ userId });
        // Seed default notifications for user if empty
        if (total === 0) {
            const docsToInsert = SEED_NOTIFICATIONS.map((n, idx) => ({
                ...n,
                userId,
                createdAt: new Date(Date.now() - idx * 3600 * 1000 * 4), // spaced by hours
            }));
            await notification_model_1.Notification.insertMany(docsToInsert);
            total = await notification_model_1.Notification.countDocuments({ userId });
        }
        const notifications = await notification_model_1.Notification.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const unreadCount = await notification_model_1.Notification.countDocuments({ userId, isRead: false });
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
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
    }
};
exports.getUserNotifications = getUserNotifications;
/**
 * Mark single notification as read
 */
const markNotificationRead = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { id } = req.params;
        const notification = await notification_model_1.Notification.findOneAndUpdate({ _id: id, userId }, { isRead: true }, { new: true });
        if (!notification) {
            res.status(404).json({ success: false, message: 'Notification not found' });
            return;
        }
        const unreadCount = await notification_model_1.Notification.countDocuments({ userId, isRead: false });
        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: { notification, unreadCount },
        });
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: 'Failed to update notification', error: error.message });
    }
};
exports.markNotificationRead = markNotificationRead;
/**
 * Mark all notifications for user as read
 */
const markAllNotificationsRead = async (req, res) => {
    try {
        const userId = req.user?._id;
        await notification_model_1.Notification.updateMany({ userId, isRead: false }, { isRead: true });
        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            data: { unreadCount: 0 },
        });
    }
    catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, message: 'Failed to update notifications', error: error.message });
    }
};
exports.markAllNotificationsRead = markAllNotificationsRead;
