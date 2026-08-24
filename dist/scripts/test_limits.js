"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const user_model_1 = __importDefault(require("../models/user.model"));
const env_1 = require("../config/env");
const limit_checker_1 = require("../utils/limit_checker");
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
async function runLimitsTest() {
    try {
        console.log('Connecting to database...');
        await mongoose_1.default.connect(env_1.config.mongodbUri);
        console.log('Connected to database.');
        // Find test user
        const user = await user_model_1.default.findOne({});
        if (!user) {
            console.error('No users found in database. Register a user first.');
            process.exit(1);
        }
        console.log(`Using test user: ${user.name} (${user.email}) - ID: ${user._id}`);
        // Reset user to basic plan with 0 counts
        user.currentPlan = 'basic';
        user.subscriptionStatus = 'inactive';
        user.dailyFoodScansCount = 0;
        user.lastScanResetDate = new Date();
        await user.save();
        console.log('Test user reset to Basic tier with 0 scans.');
        // Simulate 3 scans (should succeed)
        console.log('\n--- Simulating 3 Basic food scans ---');
        for (let i = 1; i <= 3; i++) {
            const res = await (0, limit_checker_1.checkAndIncrementScanLimit)(user._id.toString(), 'foodScans');
            console.log(`Scan #${i}: allowed = ${res.allowed}, remaining = ${res.remaining}, limit = ${res.limit}`);
        }
        // Simulate 4th scan (should fail / block)
        console.log('\n--- Simulating 4th scan (limit is 3) ---');
        const resBlocked = await (0, limit_checker_1.checkAndIncrementScanLimit)(user._id.toString(), 'foodScans');
        console.log(`Scan #4: allowed = ${resBlocked.allowed}, remaining = ${resBlocked.remaining}, limit = ${resBlocked.limit}`);
        if (!resBlocked.allowed) {
            console.log('✅ Blocked 4th scan successfully!');
        }
        else {
            console.error('❌ Failed: 4th scan was allowed!');
        }
        // Simulate day change reset
        console.log('\n--- Simulating day change (moving reset date to yesterday) ---');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        await user_model_1.default.findByIdAndUpdate(user._id, { lastScanResetDate: yesterday });
        const resReset = await (0, limit_checker_1.checkAndIncrementScanLimit)(user._id.toString(), 'foodScans');
        console.log(`Scan after day change: allowed = ${resReset.allowed}, remaining = ${resReset.remaining}, limit = ${resReset.limit}`);
        if (resReset.allowed) {
            console.log('✅ Day change successfully reset counter and allowed scan!');
        }
        else {
            console.error('❌ Failed: Day change did not reset scan count!');
        }
        // Upgrade to Premium
        console.log('\n--- Upgrading user to Premium ---');
        await user_model_1.default.findByIdAndUpdate(user._id, { currentPlan: 'premium', subscriptionStatus: 'active' });
        const resPremium = await (0, limit_checker_1.checkAndIncrementScanLimit)(user._id.toString(), 'foodScans');
        console.log(`Scan as Premium: allowed = ${resPremium.allowed}, remaining = ${resPremium.remaining}, limit = ${resPremium.limit}`);
        if (resPremium.allowed && resPremium.remaining === -1) {
            console.log('✅ Premium checks passed successfully (unlimited)!');
        }
        else {
            console.error('❌ Failed: Premium limit was restricted!');
        }
        // Restore original state
        console.log('\n--- Restoring user to original state ---');
        await user_model_1.default.findByIdAndUpdate(user._id, {
            currentPlan: 'basic',
            subscriptionStatus: 'inactive',
            dailyFoodScansCount: 0,
            lastScanResetDate: new Date()
        });
        console.log('Database cleaned up.');
    }
    catch (error) {
        console.error('Error during limits check test:', error.message || error);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
}
runLimitsTest();
