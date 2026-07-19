import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import SubscriptionPlan from '../models/subscription_plan.model';
import User from '../models/user.model';

export class SubscriptionController {
  public static async getPlans(req: Request, res: Response) {
    try {
      const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 }).lean();
      return res.json({ plans });
    } catch (error: any) {
      console.error('[SUBSCRIPTION] GetPlans Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public static async selectPlan(req: AuthRequest, res: Response) {
    try {
      const { planType } = req.body;
      if (!planType || !['basic', 'premium'].includes(planType)) {
        return res.status(400).json({ error: "Invalid planType. Must be 'basic' or 'premium'" });
      }

      const plan = await SubscriptionPlan.findOne({ type: planType, isActive: true });
      if (!plan) {
        return res.status(404).json({ error: `Subscription plan '${planType}' not found` });
      }

      const user = await User.findByIdAndUpdate(
        req.userId,
        {
          $set: {
            currentPlan: plan.type,
            subscriptionPlanId: plan._id,
            subscriptionStatus: 'active',
            hasSelectedSubscription: true,
          },
        },
        { returnDocument: 'after' }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log(`[SUBSCRIPTION] User ${req.userId} selected plan: ${plan.name} ($${plan.price}/mo)`);
      return res.json({
        message: 'Subscription plan updated successfully',
        plan,
        user,
      });
    } catch (error: any) {
      console.error('[SUBSCRIPTION] SelectPlan Error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  public static async getMySubscription(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.userId).select('currentPlan subscriptionPlanId subscriptionStatus hasSelectedSubscription subscriptionExpiresAt').lean();
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let plan = null;
      if (user.currentPlan) {
        plan = await SubscriptionPlan.findOne({ type: user.currentPlan }).lean();
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
    } catch (error: any) {
      console.error('[SUBSCRIPTION] GetMySubscription Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
