import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import SubscriptionPlan from '../../models/subscription_plan.model';

export class AdminSubscriptionController {
  public static async getPlans(req: AuthRequest, res: Response) {
    try {
      const plans = await SubscriptionPlan.find().sort({ price: 1 }).lean();
      return res.json({ plans });
    } catch (error: any) {
      console.error('[ADMIN SUBSCRIPTION] GetPlans error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public static async updatePlan(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, price, features, dailyLimits, isActive } = req.body;

      const updates: Record<string, any> = {};
      if (name !== undefined) updates.name = name;
      if (price !== undefined && typeof price === 'number') updates.price = price;
      if (Array.isArray(features)) updates.features = features;
      if (dailyLimits && typeof dailyLimits === 'object') {
        updates.dailyLimits = dailyLimits;
      }
      if (isActive !== undefined) updates.isActive = Boolean(isActive);

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update' });
      }

      const plan = await SubscriptionPlan.findByIdAndUpdate(
        id,
        { $set: updates },
        { returnDocument: 'after', runValidators: true }
      );

      if (!plan) {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }

      console.log(`[ADMIN SUBSCRIPTION] Plan ${plan.name} (${id}) updated by admin ${req.userId}`);
      return res.json({ message: 'Subscription plan updated successfully', plan });
    } catch (error: any) {
      console.error('[ADMIN SUBSCRIPTION] UpdatePlan error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
