"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperAdmin = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const SUPER_ADMIN = {
    email: 'support@getgocal.com',
    password: 'Asha@123',
    name: 'Super Admin',
    role: 'superadmin',
};
const seedSuperAdmin = async () => {
    try {
        const existing = await user_model_1.default.findOne({ email: SUPER_ADMIN.email }).lean();
        if (existing) {
            // Ensure existing account has superadmin role (idempotent fix)
            if (existing.role !== 'superadmin') {
                await user_model_1.default.findByIdAndUpdate(existing._id, { role: 'superadmin' });
                console.log('[SEED] Upgraded existing account to superadmin:', SUPER_ADMIN.email);
            }
            else {
                console.log('[SEED] Superadmin already exists, skipping.');
            }
            return;
        }
        const admin = new user_model_1.default({
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
    }
    catch (error) {
        console.error('[SEED] Failed to seed superadmin:', error);
    }
};
exports.seedSuperAdmin = seedSuperAdmin;
