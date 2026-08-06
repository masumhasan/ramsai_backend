import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/user.model';
import Feedback from '../models/feedback.model';

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
}
