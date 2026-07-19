import SubscriptionPlan from '../models/subscription_plan.model';

const DEFAULT_PLANS = [
  {
    name: 'Basic Plan',
    type: 'basic' as const,
    price: 0.0,
    billingCycle: 'monthly' as const,
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
    type: 'premium' as const,
    price: 4.99,
    billingCycle: 'monthly' as const,
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

export const seedSubscriptionPlans = async (): Promise<void> => {
  try {
    for (const planData of DEFAULT_PLANS) {
      const existing = await SubscriptionPlan.findOne({ type: planData.type });
      if (!existing) {
        await SubscriptionPlan.create(planData);
        console.log(`[SEED] Created default subscription plan: ${planData.name}`);
      } else {
        console.log(`[SEED] Subscription plan '${planData.name}' already exists.`);
      }
    }
  } catch (error) {
    console.error('[SEED] Failed to seed subscription plans:', error);
  }
};
