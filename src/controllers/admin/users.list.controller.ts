import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import User from '../../models/user.model';

type SortField = 'createdAt' | 'lastActiveAt' | 'role' | 'name';
type SortOrder = 'asc' | 'desc';

const SAFE_USER_FIELDS = 'name email role createdAt lastActiveAt subscriptionStatus hasCompletedOnboarding age gender isBanned currentPlan hasSelectedSubscription';

export class AdminUsersListController {
  public static async getUsers(req: AuthRequest, res: Response) {
    try {
      const {
        page = '1',
        limit = '20',
        search = '',
        role,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query as Record<string, string>;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const skip = (pageNum - 1) * limitNum;

      const filter: Record<string, any> = {};

      if (search.trim()) {
        const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = [
          { name: { $regex: escaped, $options: 'i' } },
          { email: { $regex: escaped, $options: 'i' } },
        ];
      }

      if (role && ['superadmin', 'admin', 'user'].includes(role)) {
        filter.role = role;
      }

      const allowedSortFields: SortField[] = ['createdAt', 'lastActiveAt', 'role', 'name'];
      const sortField: SortField = allowedSortFields.includes(sortBy as SortField)
        ? (sortBy as SortField)
        : 'createdAt';
      const sortDir: SortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

      const [users, total] = await Promise.all([
        User.find(filter)
          .select(SAFE_USER_FIELDS)
          .sort({ [sortField]: sortDir === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        User.countDocuments(filter),
      ]);

      return res.json({
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      console.error('[ADMIN USERS] GetUsers error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
