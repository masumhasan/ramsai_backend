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
        const existing = await user_model_1.default.findOne({ email: SUPER_ADMIN.email });
        if (existing) {
            existing.role = 'superadmin';
            existing.password = SUPER_ADMIN.password;
            await existing.save();
            console.log('[SEED] Superadmin account verified & updated:', SUPER_ADMIN.email);
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
