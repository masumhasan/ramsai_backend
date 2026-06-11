import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import User, { UserRole } from '../../models/user.model';

const VALID_ROLES: UserRole[] = ['superadmin', 'admin', 'user'];

export class AdminUsersRoleController {
  public static async updateRole(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !VALID_ROLES.includes(role as UserRole)) {
        return res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}` });
      }

      // Prevent self-role modification
      if (id === req.userId) {
        return res.status(400).json({ error: 'Cannot modify your own role' });
      }

      const target = await User.findById(id).select('role email name').lean();
      if (!target) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Only superadmin can assign or revoke admin/superadmin roles
      const isElevatedRole = (r: string) => r === 'admin' || r === 'superadmin';
      if (
        (isElevatedRole(role) || isElevatedRole(target.role)) &&
        req.userRole !== 'superadmin'
      ) {
        return res.status(403).json({
          error: 'Only superadmin can assign or revoke administrative roles',
        });
      }

      const updated = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true }
      ).select('name email role');

      console.log(
        `[ADMIN USERS] Role changed: ${target.email} ${target.role} → ${role} by ${req.userId}`
      );
      return res.json({ message: 'User role updated', user: updated });
    } catch (error: any) {
      console.error('[ADMIN USERS] UpdateRole error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
