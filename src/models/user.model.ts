import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'superadmin' | 'admin' | 'user';
export type SubscriptionStatus = 'inactive' | 'active' | 'trial' | 'expired';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  lastActiveAt?: Date;
  subscriptionStatus: SubscriptionStatus;
  otpCode?: string;
  otpExpires?: Date;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  valueType: 'metric' | 'imperial';
  height?: number; // cm or inches
  entryWeight?: number; // kg or lbs
  currentWeight?: number; // kg or lbs
  targetWeight?: number; // kg or lbs
  goal: 'Lose Weight' | 'Gain Muscle' | 'Maintain Weight' | 'Improve Endurance';
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | 'Extra Active';
  timezone: string;
  weekStart: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  workoutSchedule?: any;
  dietaryPreference: 'Everything' | 'Vegetarian' | 'Vegan' | 'Pascaterian' | 'Keto' | 'Paleo';
  language: 'en' | 'hi' | 'fr' | 'es' | 'English' | 'Hindi' | 'French' | 'Spanish';
  hasCompletedOnboarding: boolean;
  isBanned?: boolean;
  currentPlan?: 'basic' | 'premium';
  subscriptionPlanId?: mongoose.Types.ObjectId;
  hasSelectedSubscription?: boolean;
  subscriptionExpiresAt?: Date;
  nutritionalTargets?: {
    dailyCalories: number;
    dailyProtein: number;
    dailyCarbs: number;
    dailyFat: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
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
  workoutSchedule: { type: Schema.Types.Mixed },
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
  isBanned: { type: Boolean, default: false },
  currentPlan: {
    type: String,
    enum: ['basic', 'premium'],
    default: 'basic',
  },
  subscriptionPlanId: {
    type: Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
  },
  hasSelectedSubscription: {
    type: Boolean,
    default: false,
  },
  subscriptionExpiresAt: { type: Date },
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

UserSchema.pre('save', async function(this: IUser) {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
  } catch (err: any) {
    throw err;
  }
});

UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
