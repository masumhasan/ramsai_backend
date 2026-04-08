import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
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
  workoutSchedule?: any; // To be defined more specifically if needed
  dietaryPreference: 'Everything' | 'Vegetarian' | 'Vegan' | 'Pascaterian' | 'Keto' | 'Paleo';
  hasCompletedOnboarding: boolean;
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
  hasCompletedOnboarding: { type: Boolean, default: false }
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
