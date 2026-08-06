import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import Feedback from '../../models/feedback.model';
import User from '../../models/user.model';

export class AdminFeedbackController {
  public static async getFeedbacks(req: AuthRequest, res: Response) {
    try {
      const {
        page = '1',
        limit = '20',
        search = '',
      } = req.query as Record<string, string>;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const skip = (pageNum - 1) * limitNum;

      const filter: Record<string, any> = {};

      if (search.trim()) {
        const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Find users matching name or email
        const matchingUsers = await User.find({
          $or: [
            { name: { $regex: escaped, $options: 'i' } },
            { email: { $regex: escaped, $options: 'i' } },
          ],
        }).select('_id');

        const userIds = matchingUsers.map((u) => u._id);

        // Match feedback fields or matching user IDs
        filter.$or = [
          { title: { $regex: escaped, $options: 'i' } },
          { description: { $regex: escaped, $options: 'i' } },
          { userId: { $in: userIds } },
        ];
      }

      const [feedbacks, total] = await Promise.all([
        Feedback.find(filter)
          .populate('userId', 'name email role')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Feedback.countDocuments(filter),
      ]);

      return res.json({
        feedbacks,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      console.error('[ADMIN FEEDBACK] Get feedbacks error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
