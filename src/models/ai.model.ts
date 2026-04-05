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

export interface WeeklyWorkoutPlan {
  planTitle: string;
  weekNumber: number;
  days: WorkoutDay[];
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
