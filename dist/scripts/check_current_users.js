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
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
async function checkUsers() {
    try {
        await mongoose_1.default.connect(env_1.config.mongodbUri);
        const users = await user_model_1.default.find({}).select('name email currentPlan subscriptionStatus dailyFoodScansCount dailyProductScansCount lastScanResetDate');
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
    }
    catch (err) {
        console.error('Error querying users:', err);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
}
checkUsers();
