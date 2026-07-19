"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const subscription_plan_model_1 = __importDefault(require("../models/subscription_plan.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
class SubscriptionController {
    static async getPlans(req, res) {
        try {
            const plans = await subscription_plan_model_1.default.find({ isActive: true }).sort({ price: 1 }).lean();
            return res.json({ plans });
        }
        catch (error) {
            console.error('[SUBSCRIPTION] GetPlans Error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async selectPlan(req, res) {
        try {
            const { planType } = req.body;
            if (!planType || !['basic', 'premium'].includes(planType)) {
                return res.status(400).json({ error: "Invalid planType. Must be 'basic' or 'premium'" });
            }
            const plan = await subscription_plan_model_1.default.findOne({ type: planType, isActive: true });
            if (!plan) {
                return res.status(404).json({ error: `Subscription plan '${planType}' not found` });
            }
            const user = await user_model_1.default.findByIdAndUpdate(req.userId, {
                $set: {
                    currentPlan: plan.type,
                    subscriptionPlanId: plan._id,
                    subscriptionStatus: 'active',
                    hasSelectedSubscription: true,
                },
            }, { returnDocument: 'after' }).select('-password');
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            console.log(`[SUBSCRIPTION] User ${req.userId} selected plan: ${plan.name} ($${plan.price}/mo)`);
            return res.json({
                message: 'Subscription plan updated successfully',
                plan,
                user,
            });
        }
        catch (error) {
            console.error('[SUBSCRIPTION] SelectPlan Error:', error);
            return res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }
    static async getMySubscription(req, res) {
        try {
            const user = await user_model_1.default.findById(req.userId).select('currentPlan subscriptionPlanId subscriptionStatus hasSelectedSubscription subscriptionExpiresAt').lean();
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            let plan = null;
            if (user.currentPlan) {
                plan = await subscription_plan_model_1.default.findOne({ type: user.currentPlan }).lean();
            }
            return res.json({
                subscription: {
                    currentPlan: user.currentPlan || 'basic',
                    status: user.subscriptionStatus || 'active',
                    hasSelectedSubscription: user.hasSelectedSubscription ?? false,
                    expiresAt: user.subscriptionExpiresAt || null,
                    plan,
                },
            });
        }
        catch (error) {
            console.error('[SUBSCRIPTION] GetMySubscription Error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.SubscriptionController = SubscriptionController;
