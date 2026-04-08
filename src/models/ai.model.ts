import mongoose, { Schema, Document } from 'mongoose';

export interface FoodIngredient {
  name: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: string;
}

export interface FoodAnalysisResult {
  dishName: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  ingredients: FoodIngredient[];
  aiInsights: string[];
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  duration?: string;
  notes?: string;
}

export interface WorkoutDay {
  day: string;
  title: string;
  exercises: WorkoutExercise[];
  isRestDay: boolean;
}

export interface NutritionalTargets {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
}

export interface WeeklyWorkoutPlan {
  planTitle: string;
  weekNumber: number;
  days: WorkoutDay[];
  nutritionalTargets: NutritionalTargets;
}

export interface BurnActivity {
  activity: string;
  duration: string;
  caloriesBurned: number;
  intensity?: string;
}

export interface BurnAnalysisResult {
  totalCaloriesBurned: number;
  activities: BurnActivity[];
  summary: string;
}

// Mongoose Schema for persistence
export interface IWeeklyWorkoutPlan extends WeeklyWorkoutPlan, Document {
  userId: mongoose.Types.ObjectId;
}

const WeeklyWorkoutPlanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  planTitle: { type: String, required: true },
  weekNumber: { type: Number, required: true },
  days: [{
    day: { type: String, required: true },
    title: { type: String, required: true },
    exercises: [{
      name: { type: String, required: true },
      sets: { type: Number, required: true },
      reps: { type: String, required: true },
      duration: { type: String },
      notes: { type: String }
    }],
    isRestDay: { type: Boolean, default: false }
  }],
  nutritionalTargets: {
    dailyCalories: { type: Number },
    dailyProtein: { type: Number },
    dailyCarbs: { type: Number },
    dailyFat: { type: Number }
  }
}, { timestamps: true });

export const WeeklyWorkoutPlanModel = mongoose.model<IWeeklyWorkoutPlan>('WeeklyWorkoutPlan', WeeklyWorkoutPlanSchema);
