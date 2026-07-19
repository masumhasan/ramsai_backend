"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSubscriptionPlans = void 0;
const subscription_plan_model_1 = __importDefault(require("../models/subscription_plan.model"));
const DEFAULT_PLANS = [
    {
        name: 'Basic Plan',
        type: 'basic',
        price: 0.0,
        billingCycle: 'monthly',
        features: [
            '3 AI Food Scans per day',
            '2 Product scan per day (barcode+ocr)',
            'Standard workout routines',
            'Basic calorie tracking',
        ],
        dailyLimits: {
            foodScans: 3,
            productScans: 2,
        },
        isActive: true,
    },
    {
        name: 'Premium Plan',
        type: 'premium',
        price: 4.99,
        billingCycle: 'monthly',
        features: [
            'Unlimited AI Food Scans',
            'Unlimited Product scan per day (barcode+ocr)',
            'Personalized AI Workout Plans',
            'Detailed Macro & Nutrient Reports',
        ],
        dailyLimits: {
            foodScans: -1,
            productScans: -1,
        },
        isActive: true,
    },
];
const seedSubscriptionPlans = async () => {
    try {
        for (const planData of DEFAULT_PLANS) {
            const existing = await subscription_plan_model_1.default.findOne({ type: planData.type });
            if (!existing) {
                await subscription_plan_model_1.default.create(planData);
                console.log(`[SEED] Created default subscription plan: ${planData.name}`);
            }
            else {
                console.log(`[SEED] Subscription plan '${planData.name}' already exists.`);
            }
        }
    }
    catch (error) {
        console.error('[SEED] Failed to seed subscription plans:', error);
    }
};
exports.seedSubscriptionPlans = seedSubscriptionPlans;
