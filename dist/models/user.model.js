"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    valueType: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    height: { type: Number },
    entryWeight: { type: Number },
    currentWeight: { type: Number },
    targetWeight: { type: Number },
    goal: {
        type: String,
        enum: ['Lose Weight', 'Gain Muscle', 'Maintain Weight', 'Improve Endurance'],
        default: 'Maintain Weight'
    },
    activityLevel: {
        type: String,
        enum: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extra Active'],
        default: 'Sedentary'
    },
    timezone: { type: String, default: 'UTC' },
    weekStart: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        default: 'Monday'
    },
    workoutSchedule: { type: mongoose_1.Schema.Types.Mixed },
    dietaryPreference: {
        type: String,
        enum: ['Everything', 'Vegetarian', 'Vegan', 'Pascaterian', 'Keto', 'Paleo'],
        default: 'Everything'
    },
    language: {
        type: String,
        enum: ['en', 'hi', 'fr', 'es', 'English', 'Hindi', 'French', 'Spanish'],
        default: 'en'
    },
    role: {
        type: String,
        enum: ['superadmin', 'admin', 'user'],
        default: 'user',
        index: true,
    },
    lastActiveAt: { type: Date },
    subscriptionStatus: {
        type: String,
        enum: ['inactive', 'active', 'trial', 'expired'],
        default: 'inactive',
    },
    otpCode: { type: String },
    otpExpires: { type: Date },
    hasCompletedOnboarding: { type: Boolean, default: false },
    nutritionalTargets: {
        dailyCalories: { type: Number },
        dailyProtein: { type: Number },
        dailyCarbs: { type: Number },
        dailyFat: { type: Number }
    }
}, { timestamps: true });
UserSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return;
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
    }
    catch (err) {
        throw err;
    }
});
UserSchema.methods.comparePassword = async function (password) {
    return bcryptjs_1.default.compare(password, this.password);
};
exports.default = mongoose_1.default.model('User', UserSchema);
