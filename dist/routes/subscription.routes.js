"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_controller_1 = require("../controllers/subscription.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public / Authenticated plans listing
router.get('/plans', subscription_controller_1.SubscriptionController.getPlans);
// Authenticated user subscription endpoints
router.post('/select', auth_middleware_1.authenticate, subscription_controller_1.SubscriptionController.selectPlan);
router.get('/my-subscription', auth_middleware_1.authenticate, subscription_controller_1.SubscriptionController.getMySubscription);
exports.default = router;
