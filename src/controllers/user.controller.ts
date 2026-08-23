import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/user.model';
import Feedback from '../models/feedback.model';
import FcmToken from '../models/fcmToken.model';
import { Notification } from '../models/notification.model';
import { WeeklyWorkoutPlanModel } from '../models/ai.model';
import { WorkoutLog, MealLog, BurnLog, WeightLog } from '../models/log.model';

export class UserController {
  public static async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.userId).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(user);
    } catch (error: any) {
      console.error('Get Profile Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const updates = req.body;
      
      // Prevent updating password through this route
      delete updates.password;
      delete updates.email;

      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: updates },
        { returnDocument: 'after', runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (updates.currentWeight || updates.targetWeight) {
        console.log(`[USER] ⚖️ Weight Update: Current: ${user.currentWeight}, Target: ${user.targetWeight} for user ${req.userId}`);
      } else {
        console.log(`[USER] 👤 Profile updated for user ${req.userId}`);
      }

      return res.json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error: any) {
      console.error(`[USER ERROR] Profile update failed: ${error.message}`);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  public static async submitFeedback(req: AuthRequest, res: Response) {
    try {
      const { title, description, images } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      const feedback = new Feedback({
        userId: req.userId,
        title,
        description,
        images: images || [],
      });

      await feedback.save();

      console.log(`[USER] 📝 Feedback submitted by user ${req.userId}`);

      return res.status(201).json({
        message: 'Feedback submitted successfully',
        feedback
      });
    } catch (error: any) {
      console.error('[USER ERROR] Submit feedback failed:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public static async deleteAccount(req: AuthRequest, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required to confirm account deletion' });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
        return res.status(400).json({ error: 'The email address you entered does not match your account email' });
      }

      // Delete user's associated data
      await Promise.all([
        FcmToken.deleteMany({ userId: req.userId }),
        Notification.deleteMany({ userId: req.userId }),
        Feedback.deleteMany({ userId: req.userId }),
        WeeklyWorkoutPlanModel.deleteMany({ userId: req.userId }),
        WorkoutLog.deleteMany({ userId: req.userId }),
        MealLog.deleteMany({ userId: req.userId }),
        BurnLog.deleteMany({ userId: req.userId }),
        WeightLog.deleteMany({ userId: req.userId }),
        User.findByIdAndDelete(req.userId)
      ]);

      console.log(`[USER] 🗑️ Account permanently deleted for user ${req.userId} (${user.email})`);

      return res.json({
        message: 'Account successfully deleted'
      });
    } catch (error: any) {
      console.error('[USER ERROR] Account deletion failed:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
