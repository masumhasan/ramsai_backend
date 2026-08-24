import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/user.model';
import { config } from '../config/env';
import { checkAndIncrementScanLimit } from '../utils/limit_checker';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function runLimitsTest() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to database.');

    // Find test user
    const user = await User.findOne({});
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
      const res = await checkAndIncrementScanLimit(user._id.toString(), 'foodScans');
      console.log(`Scan #${i}: allowed = ${res.allowed}, remaining = ${res.remaining}, limit = ${res.limit}`);
    }

    // Simulate 4th scan (should fail / block)
    console.log('\n--- Simulating 4th scan (limit is 3) ---');
    const resBlocked = await checkAndIncrementScanLimit(user._id.toString(), 'foodScans');
    console.log(`Scan #4: allowed = ${resBlocked.allowed}, remaining = ${resBlocked.remaining}, limit = ${resBlocked.limit}`);
    if (!resBlocked.allowed) {
      console.log('✅ Blocked 4th scan successfully!');
    } else {
      console.error('❌ Failed: 4th scan was allowed!');
    }

    // Simulate day change reset
    console.log('\n--- Simulating day change (moving reset date to yesterday) ---');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await User.findByIdAndUpdate(user._id, { lastScanResetDate: yesterday });

    const resReset = await checkAndIncrementScanLimit(user._id.toString(), 'foodScans');
    console.log(`Scan after day change: allowed = ${resReset.allowed}, remaining = ${resReset.remaining}, limit = ${resReset.limit}`);
    if (resReset.allowed) {
      console.log('✅ Day change successfully reset counter and allowed scan!');
    } else {
      console.error('❌ Failed: Day change did not reset scan count!');
    }

    // Upgrade to Premium
    console.log('\n--- Upgrading user to Premium ---');
    await User.findByIdAndUpdate(user._id, { currentPlan: 'premium', subscriptionStatus: 'active' });
    const resPremium = await checkAndIncrementScanLimit(user._id.toString(), 'foodScans');
    console.log(`Scan as Premium: allowed = ${resPremium.allowed}, remaining = ${resPremium.remaining}, limit = ${resPremium.limit}`);
    if (resPremium.allowed && resPremium.remaining === -1) {
      console.log('✅ Premium checks passed successfully (unlimited)!');
    } else {
      console.error('❌ Failed: Premium limit was restricted!');
    }

    // Restore original state
    console.log('\n--- Restoring user to original state ---');
    await User.findByIdAndUpdate(user._id, {
      currentPlan: 'basic',
      subscriptionStatus: 'inactive',
      dailyFoodScansCount: 0,
      lastScanResetDate: new Date()
    });
    console.log('Database cleaned up.');

  } catch (error: any) {
    console.error('Error during limits check test:', error.message || error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runLimitsTest();
