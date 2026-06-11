import User from '../models/user.model';

const SUPER_ADMIN = {
  email: 'support@getgocal.com',
  password: 'Asha@123',
  name: 'Super Admin',
  role: 'superadmin' as const,
};

export const seedSuperAdmin = async (): Promise<void> => {
  try {
    const existing = await User.findOne({ email: SUPER_ADMIN.email }).lean();
    if (existing) {
      // Ensure existing account has superadmin role (idempotent fix)
      if (existing.role !== 'superadmin') {
        await User.findByIdAndUpdate(existing._id, { role: 'superadmin' });
        console.log('[SEED] Upgraded existing account to superadmin:', SUPER_ADMIN.email);
      } else {
        console.log('[SEED] Superadmin already exists, skipping.');
      }
      return;
    }

    const admin = new User({
      email: SUPER_ADMIN.email,
      password: SUPER_ADMIN.password,
      name: SUPER_ADMIN.name,
      role: SUPER_ADMIN.role,
      goal: 'Maintain Weight',
      activityLevel: 'Sedentary',
      timezone: 'UTC',
      weekStart: 'Monday',
      dietaryPreference: 'Everything',
      language: 'en',
      valueType: 'metric',
      hasCompletedOnboarding: true,
    });

    await admin.save();
    console.log('[SEED] Superadmin created:', SUPER_ADMIN.email);
  } catch (error) {
    console.error('[SEED] Failed to seed superadmin:', error);
  }
};
