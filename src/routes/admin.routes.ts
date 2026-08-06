import { Router } from 'express';
import { AdminAuthController } from '../controllers/admin/auth.controller';
import { AdminUsersListController } from '../controllers/admin/users.list.controller';
import { AdminUsersCrudController } from '../controllers/admin/users.crud.controller';
import { AdminUsersRoleController } from '../controllers/admin/users.role.controller';
import { AdminSubscriptionController } from '../controllers/admin/subscription.controller';
import { AdminFeedbackController } from '../controllers/admin/feedback.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireSuperAdmin } from '../middleware/admin.middleware';

const router = Router();

// Admin authentication — public endpoints
router.post('/auth/login', AdminAuthController.login);
router.post('/auth/forgot-password', AdminAuthController.sendOtp);
router.post('/auth/verify-otp', AdminAuthController.verifyOtp);
router.post('/auth/reset-password', AdminAuthController.resetPassword);

// User management — requires admin role
router.get('/users', authenticate, requireAdmin, AdminUsersListController.getUsers);
router.get('/users/:id', authenticate, requireAdmin, AdminUsersCrudController.getUser);
router.put('/users/:id', authenticate, requireAdmin, AdminUsersCrudController.updateUser);
router.delete('/users/:id', authenticate, requireAdmin, AdminUsersCrudController.deleteUser);

// Role management — requires superadmin
router.patch('/users/:id/role', authenticate, requireSuperAdmin, AdminUsersRoleController.updateRole);

// Subscription plan management — requires admin
router.get('/subscription-plans', authenticate, requireAdmin, AdminSubscriptionController.getPlans);
router.put('/subscription-plans/:id', authenticate, requireAdmin, AdminSubscriptionController.updatePlan);

// Feedback management — requires admin
router.get('/feedbacks', authenticate, requireAdmin, AdminFeedbackController.getFeedbacks);

export default router;
