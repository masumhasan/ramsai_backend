import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import User from '../models/user.model';
import { UserRole } from '../models/user.model';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: UserRole;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    req.userId = decoded.userId;

    const user = await User.findById(decoded.userId).select('role lastActiveAt isBanned').lean();
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Account is banned' });
    }

    req.userRole = user.role as UserRole;

    // Update lastActiveAt without blocking the request
    User.findByIdAndUpdate(decoded.userId, { lastActiveAt: new Date() }).exec();

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
