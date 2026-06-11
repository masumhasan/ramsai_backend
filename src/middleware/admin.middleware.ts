import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const role = req.userRole;
  if (role !== 'admin' && role !== 'superadmin') {
    return res.status(403).json({ error: 'Access denied: admin privileges required' });
  }
  next();
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'superadmin') {
    return res.status(403).json({ error: 'Access denied: superadmin privileges required' });
  }
  next();
};
