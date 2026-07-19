"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
// User endpoints
router.get('/', auth_middleware_1.authenticate, notification_controller_1.getUserNotifications);
router.patch('/read-all', auth_middleware_1.authenticate, notification_controller_1.markAllNotificationsRead);
router.patch('/:id/read', auth_middleware_1.authenticate, notification_controller_1.markNotificationRead);
// Admin Broadcast endpoints
router.post('/broadcast', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, notification_controller_1.broadcastNotification);
router.get('/broadcast/history', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, notification_controller_1.getBroadcastHistory);
exports.default = router;
