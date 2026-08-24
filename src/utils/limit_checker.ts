import User from '../models/user.model';
import SubscriptionPlan from '../models/subscription_plan.model';

/**
 * Checks if a basic plan user has reached their daily limit for a scan type.
 * Resets the count automatically if the calendar day has changed.
 * If allowed, increments the counter.
 * If premium or active trial, allows request unconditionally.
 */
export async function checkAndIncrementScanLimit(
  userId: string,
  scanType: 'foodScans' | 'productScans'
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // If user is premium, they have unlimited scans
  if (user.currentPlan === 'premium' || user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial') {
    return { allowed: true, remaining: -1, limit: -1 };
  }

  // Find free plan daily limits
  const freePlan = await SubscriptionPlan.findOne({ type: 'basic' }).lean();
  const limit = freePlan?.dailyLimits?.[scanType] ?? (scanType === 'foodScans' ? 3 : 2);

  const now = new Date();
  const resetDate = user.lastScanResetDate || new Date(0);

  // Reset counter if it's a new day (UTC calendar day comparison)
  const isSameDay =
    now.getUTCFullYear() === resetDate.getUTCFullYear() &&
    now.getUTCMonth() === resetDate.getUTCMonth() &&
    now.getUTCDate() === resetDate.getUTCDate();

  const countField: 'dailyFoodScansCount' | 'dailyProductScansCount' =
    scanType === 'foodScans' ? 'dailyFoodScansCount' : 'dailyProductScansCount';

  let currentCount = user[countField] || 0;

  if (!isSameDay) {
    currentCount = 0;
    user[countField] = 0;
    user.lastScanResetDate = now;
  }

  if (currentCount >= limit) {
    // Save user if reset date changed, even when limit is exceeded
    if (!isSameDay) {
      await user.save();
    }
    return { allowed: false, remaining: 0, limit };
  }

  // Increment scan count
  user[countField] = currentCount + 1;
  await user.save();

  return { allowed: true, remaining: limit - (currentCount + 1), limit };
}
