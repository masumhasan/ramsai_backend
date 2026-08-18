"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/admin/auth.controller");
const users_list_controller_1 = require("../controllers/admin/users.list.controller");
const users_crud_controller_1 = require("../controllers/admin/users.crud.controller");
const users_role_controller_1 = require("../controllers/admin/users.role.controller");
const subscription_controller_1 = require("../controllers/admin/subscription.controller");
const feedback_controller_1 = require("../controllers/admin/feedback.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
// Admin authentication — public endpoints
router.post('/auth/login', auth_controller_1.AdminAuthController.login);
router.post('/auth/forgot-password', auth_controller_1.AdminAuthController.sendOtp);
router.post('/auth/verify-otp', auth_controller_1.AdminAuthController.verifyOtp);
router.post('/auth/reset-password', auth_controller_1.AdminAuthController.resetPassword);
// User management — requires admin role
router.get('/users', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, users_list_controller_1.AdminUsersListController.getUsers);
router.get('/users/:id', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, users_crud_controller_1.AdminUsersCrudController.getUser);
router.put('/users/:id', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, users_crud_controller_1.AdminUsersCrudController.updateUser);
router.delete('/users/:id', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, users_crud_controller_1.AdminUsersCrudController.deleteUser);
// Role management — requires superadmin
router.patch('/users/:id/role', auth_middleware_1.authenticate, admin_middleware_1.requireSuperAdmin, users_role_controller_1.AdminUsersRoleController.updateRole);
// Subscription plan management — requires admin
router.get('/subscription-plans', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, subscription_controller_1.AdminSubscriptionController.getPlans);
router.put('/subscription-plans/:id', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, subscription_controller_1.AdminSubscriptionController.updatePlan);
// Feedback management — requires admin
router.get('/feedbacks', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, feedback_controller_1.AdminFeedbackController.getFeedbacks);
exports.default = router;
