import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/user.model';
import { config } from '../config/env';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function runTest() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to database.');

    // Find a test user in database
    const testUser = await User.findOne({});
    if (!testUser) {
      console.error('No users found in the database. Please register/create a user first.');
      process.exit(1);
    }

    console.log(`Found test user: ${testUser.name} (${testUser.email}) with ID: ${testUser._id}`);

    // Mock RevenueCat webhook payload
    const webhookPayload = {
      event: {
        type: 'INITIAL_PURCHASE',
        id: 'evt_test_1234567890',
        app_user_id: testUser._id.toString(),
        entitlement_id: 'premium',
        product_id: 'gocal_premium_monthly',
        environment: 'SANDBOX'
      }
    };

    console.log('Firing simulated RevenueCat Webhook to http://localhost:5000/api/subscription/webhook ...');
    
    // Note: We use the local server running on port 5000
    const response = await axios.post(
      'http://localhost:5000/api/subscription/webhook',
      webhookPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: config.rcBearer
        }
      }
    );

    console.log('Webhook Response:', response.data);

    // Re-fetch the user and verify database was updated
    const updatedUser = await User.findById(testUser._id);
    if (updatedUser) {
      console.log('\n--- Database Subscription Fields ---');
      console.log('subscriptionStatus:', updatedUser.subscriptionStatus);
      console.log('currentPlan:', updatedUser.currentPlan);
      console.log('subscriptionProductId:', updatedUser.subscriptionProductId);
      console.log('subscriptionWillRenew:', updatedUser.subscriptionWillRenew);
      console.log('subscriptionExpiresAt:', updatedUser.subscriptionExpiresAt);
      console.log('revenueCatAppUserId:', updatedUser.revenueCatAppUserId);
      console.log('subscriptionUpdatedAt:', updatedUser.subscriptionUpdatedAt);
      console.log('------------------------------------');
      
      if (updatedUser.subscriptionStatus === 'active' || updatedUser.subscriptionStatus === 'trial') {
        console.log('✅ Webhook verification test passed successfully!');
      } else {
        console.log('❌ Webhook test failed: subscription status was not updated properly.');
      }
    }

  } catch (error: any) {
    console.error('Test execution failed:', error.message || error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest();
