"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const subscription_plan_model_1 = __importDefault(require("../models/subscription_plan.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
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
    static async handleRevenueCatWebhook(req, res) {
        try {
            const authHeader = req.headers.authorization;
            const expectedBearer = env_1.config.rcBearer;
            // Verify the authorization token
            if (!authHeader || authHeader !== expectedBearer) {
                console.warn('[REVENUECAT WEBHOOK] Unauthorized request received. Auth Header:', authHeader);
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { event } = req.body;
            if (!event) {
                return res.status(400).json({ error: 'Missing event payload' });
            }
            const { type, app_user_id } = event;
            console.log(`[REVENUECAT WEBHOOK] Event type: ${type} received for User: ${app_user_id}`);
            // Locate user by MongoDB Object ID (app_user_id maps to User._id)
            const user = await user_model_1.default.findById(app_user_id);
            if (!user) {
                console.warn(`[REVENUECAT WEBHOOK] User not found in DB: ${app_user_id}`);
                return res.status(404).json({ error: 'User not found' });
            }
            let subscriptionStatus = 'inactive';
            let currentPlan = 'basic';
            let subscriptionExpiresAt = null;
            let subscriptionProductId = null;
            let subscriptionWillRenew = false;
            try {
                // Fetch authoritative customer info from RevenueCat REST API
                const rcResponse = await axios_1.default.get(`https://api.revenuecat.com/v1/subscribers/${app_user_id}`, {
                    headers: {
                        Authorization: `Bearer ${env_1.config.rcApiKey}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000,
                });
                const subscriber = rcResponse.data?.subscriber;
                if (!subscriber) {
                    throw new Error('Subscriber not found in RC response');
                }
                const entitlements = subscriber.entitlements || {};
                const subscriptions = subscriber.subscriptions || {};
                // Premium entitlement is our primary subscription level
                const premiumEntitlement = entitlements.premium;
                if (premiumEntitlement) {
                    const expiresDateStr = premiumEntitlement.expires_date;
                    const expiresDate = expiresDateStr ? new Date(expiresDateStr) : null;
                    // If entitlement has no expiration date (lifetime) or expires in the future, it is active
                    const isActive = !expiresDate || expiresDate.getTime() > Date.now();
                    if (isActive) {
                        currentPlan = 'premium';
                        subscriptionExpiresAt = expiresDate;
                        subscriptionProductId = premiumEntitlement.product_identifier;
                        // Check if this product is a trial or regular subscription
                        const productDetails = subscriptionProductId ? subscriptions[subscriptionProductId] : null;
                        if (productDetails) {
                            subscriptionStatus = productDetails.period_type === 'trial' ? 'trial' : 'active';
                            subscriptionWillRenew = productDetails.unsubscribe_detected_at === null;
                        }
                        else {
                            subscriptionStatus = 'active';
                            subscriptionWillRenew = true;
                        }
                    }
                    else {
                        subscriptionStatus = 'expired';
                        currentPlan = 'basic';
                        subscriptionExpiresAt = expiresDate;
                        subscriptionProductId = premiumEntitlement.product_identifier;
                        subscriptionWillRenew = false;
                    }
                }
                else {
                    subscriptionStatus = 'inactive';
                    currentPlan = 'basic';
                    subscriptionExpiresAt = null;
                    subscriptionProductId = null;
                    subscriptionWillRenew = false;
                }
            }
            catch (apiError) {
                console.warn(`[REVENUECAT WEBHOOK] REST API query failed (falling back to payload parsing):`, apiError.message || apiError);
                // Fallback: Parse the webhook event directly to determine state
                const { entitlement_id, product_id, expiration_at_ms, entitlement_ids } = event;
                const expiresDate = expiration_at_ms ? new Date(expiration_at_ms) : null;
                const isActive = !expiresDate || expiresDate.getTime() > Date.now();
                // Check if user has active premium entitlement or product
                const isPremiumActive = (entitlement_id === 'premium' || (entitlement_ids && entitlement_ids.includes('premium'))) && isActive;
                if (isPremiumActive) {
                    currentPlan = 'premium';
                    subscriptionExpiresAt = expiresDate;
                    subscriptionProductId = product_id || 'gocal_premium_monthly';
                    subscriptionStatus = (type === 'INITIAL_PURCHASE' && event.period_type === 'TRIAL') ? 'trial' : 'active';
                    subscriptionWillRenew = type !== 'CANCELLATION';
                }
                else if (type === 'EXPIRATION' || type === 'CANCELLATION') {
                    subscriptionStatus = 'expired';
                    currentPlan = 'basic';
                    subscriptionExpiresAt = expiresDate;
                    subscriptionProductId = product_id || null;
                    subscriptionWillRenew = false;
                }
                else {
                    // If we receive other events but API fails, preserve current state or default to inactive
                    subscriptionStatus = user.subscriptionStatus || 'inactive';
                    currentPlan = user.currentPlan || 'basic';
                    subscriptionExpiresAt = user.subscriptionExpiresAt || null;
                    subscriptionProductId = user.subscriptionProductId || null;
                    subscriptionWillRenew = user.subscriptionWillRenew || false;
                }
            }
            const hasSelectedSubscription = subscriptionStatus === 'active' || subscriptionStatus === 'trial' || subscriptionStatus === 'expired';
            // Update user document
            user.subscriptionStatus = subscriptionStatus;
            user.currentPlan = currentPlan;
            user.subscriptionExpiresAt = subscriptionExpiresAt || undefined;
            user.subscriptionProductId = subscriptionProductId || undefined;
            user.subscriptionWillRenew = subscriptionWillRenew;
            user.revenueCatAppUserId = app_user_id;
            user.subscriptionUpdatedAt = new Date();
            user.hasSelectedSubscription = hasSelectedSubscription;
            if (subscriptionProductId) {
                const matchedPlan = await subscription_plan_model_1.default.findOne({ type: currentPlan });
                if (matchedPlan) {
                    user.subscriptionPlanId = matchedPlan._id;
                }
            }
            else {
                user.subscriptionPlanId = undefined;
            }
            await user.save();
            console.log(`[REVENUECAT WEBHOOK] User ${app_user_id} updated. Plan: ${currentPlan}, Status: ${subscriptionStatus}`);
            return res.status(200).json({ success: true, status: subscriptionStatus, plan: currentPlan });
        }
        catch (error) {
            console.error('[REVENUECAT WEBHOOK] Error handling RevenueCat webhook:', error.message || error);
            return res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }
}
exports.SubscriptionController = SubscriptionController;
