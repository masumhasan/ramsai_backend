"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSubscriptionController = void 0;
const subscription_plan_model_1 = __importDefault(require("../../models/subscription_plan.model"));
class AdminSubscriptionController {
    static async getPlans(req, res) {
        try {
            const plans = await subscription_plan_model_1.default.find().sort({ price: 1 }).lean();
            return res.json({ plans });
        }
        catch (error) {
            console.error('[ADMIN SUBSCRIPTION] GetPlans error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async updatePlan(req, res) {
        try {
            const { id } = req.params;
            const { name, price, features, dailyLimits, isActive } = req.body;
            const updates = {};
            if (name !== undefined)
                updates.name = name;
            if (price !== undefined && typeof price === 'number')
                updates.price = price;
            if (Array.isArray(features))
                updates.features = features;
            if (dailyLimits && typeof dailyLimits === 'object') {
                updates.dailyLimits = dailyLimits;
            }
            if (isActive !== undefined)
                updates.isActive = Boolean(isActive);
            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ error: 'No valid fields provided for update' });
            }
            const plan = await subscription_plan_model_1.default.findByIdAndUpdate(id, { $set: updates }, { returnDocument: 'after', runValidators: true });
            if (!plan) {
                return res.status(404).json({ error: 'Subscription plan not found' });
            }
            console.log(`[ADMIN SUBSCRIPTION] Plan ${plan.name} (${id}) updated by admin ${req.userId}`);
            return res.json({ message: 'Subscription plan updated successfully', plan });
        }
        catch (error) {
            console.error('[ADMIN SUBSCRIPTION] UpdatePlan error:', error);
            return res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }
}
exports.AdminSubscriptionController = AdminSubscriptionController;
