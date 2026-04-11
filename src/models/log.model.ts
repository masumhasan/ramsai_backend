import mongoose, { Schema, Document } from 'mongoose';

// Base interface for Logs
export interface ILog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
}

// Workout Log
export interface IWorkoutLog extends ILog {
  workoutId?: mongoose.Types.ObjectId;
  workoutTitle?: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    weight?: number;
    completed: boolean;
  }>;
  durationMinutes: number;
  notes?: string;
}

const WorkoutLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  workoutId: { type: Schema.Types.ObjectId, ref: 'WeeklyWorkoutPlan' },
  workoutTitle: { type: String },
  exercises: [{
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true },
    weight: { type: Number },
    completed: { type: Boolean, default: true }
  }],
  durationMinutes: { type: Number },
  notes: { type: String }
}, { timestamps: true });

WorkoutLogSchema.index({ userId: 1, date: -1 });

// Meal Log
export interface IMealLog extends ILog {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  dishName: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  ingredients: Array<{
    name: string;
    servingSize: string;
    calories: number;
  }>;
}

const MealLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], required: true },
  dishName: { type: String, required: true },
  totalCalories: { type: Number, required: true },
  totalProtein: { type: Number },
  totalCarbs: { type: Number },
  totalFat: { type: Number },
  ingredients: [{
    name: { type: String },
    servingSize: { type: String },
    calories: { type: Number }
  }]
}, { timestamps: true });

MealLogSchema.index({ userId: 1, date: -1 });

// Burn Log
export interface IBurnLog extends ILog {
  activityDescription: string;
  totalCaloriesBurned: number;
  activities: Array<{
    activity: string;
    duration: string;
    caloriesBurned: number;
  }>;
}

const BurnLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  activityDescription: { type: String },
  totalCaloriesBurned: { type: Number, required: true },
  activities: [{
    activity: { type: String },
    duration: { type: String },
    caloriesBurned: { type: Number }
  }]
}, { timestamps: true });

BurnLogSchema.index({ userId: 1, date: -1 });

export const WorkoutLog = mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);
export const MealLog = mongoose.model<IMealLog>('MealLog', MealLogSchema);
export const BurnLog = mongoose.model<IBurnLog>('BurnLog', BurnLogSchema);
