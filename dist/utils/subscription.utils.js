"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkWorkoutPlanAccess = checkWorkoutPlanAccess;
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
/**
 * Checks whether a user has access to generate or regenerate AI workout plans.
 * Access is granted if:
 * 1. The user has an active premium subscription.
 * 2. The user is within their 14-day free trial period (measured from account creation or explicit trial expiration).
 */
function checkWorkoutPlanAccess(user) {
    if (!user) {
        return {
            allowed: false,
            isPremium: false,
            isTrial: false,
            daysRemaining: 0,
            trialExpiresAt: null,
        };
    }
    // 1. Premium or active subscription check
    const isPremium = user.currentPlan === 'premium' ||
        user.subscriptionStatus === 'active' ||
        user.subscriptionStatus === 'trial';
    if (isPremium) {
        return {
            allowed: true,
            isPremium: true,
            isTrial: false,
            daysRemaining: -1,
            trialExpiresAt: null,
        };
    }
    // 2. 14-day Workout Trial evaluation
    let trialExpiresAt = null;
    if (user.workoutTrialExpiresAt) {
        trialExpiresAt = new Date(user.workoutTrialExpiresAt);
    }
    else if (user.createdAt) {
        trialExpiresAt = new Date(new Date(user.createdAt).getTime() + FOURTEEN_DAYS_MS);
    }
    const now = Date.now();
    if (trialExpiresAt && now <= trialExpiresAt.getTime()) {
        const diffMs = trialExpiresAt.getTime() - now;
        const daysRemaining = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
        return {
            allowed: true,
            isPremium: false,
            isTrial: true,
            daysRemaining,
            trialExpiresAt,
        };
    }
    return {
        allowed: false,
        isPremium: false,
        isTrial: false,
        daysRemaining: 0,
        trialExpiresAt,
    };
}
