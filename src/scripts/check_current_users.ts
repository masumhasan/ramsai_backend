import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/user.model';
import { config } from '../config/env';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function checkUsers() {
  try {
    await mongoose.connect(config.mongodbUri);
    const users = await User.find({}).select('name email currentPlan subscriptionStatus dailyFoodScansCount dailyProductScansCount lastScanResetDate');
    
    console.log('\n--- Current Users in MongoDB ---');
    for (const u of users) {
      console.log(`Name: ${u.name}`);
      console.log(`Email: ${u.email}`);
      console.log(`ID: ${u._id}`);
      console.log(`Plan: ${u.currentPlan}`);
      console.log(`Sub Status: ${u.subscriptionStatus}`);
      console.log(`Food Scans Today: ${u.dailyFoodScansCount}`);
      console.log(`Product Scans Today: ${u.dailyProductScansCount}`);
      console.log(`Last Reset Date: ${u.lastScanResetDate}`);
      console.log('------------------------------------');
    }
  } catch (err: any) {
    console.error('Error querying users:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkUsers();
