import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { MealLog, WorkoutLog, BurnLog } from '../models/log.model';
import { WeeklyWorkoutPlanModel } from '../models/ai.model';

export class LogController {
  // Meal Logs
  public static async saveMealLog(req: AuthRequest, res: Response) {
    try {
      const log = new MealLog({
        ...req.body,
        userId: req.userId
      });
      await log.save();
      console.log(`[LOG] 🍴 Meal Log saved: ${log.dishName} (${log.totalCalories} kcal) for user ${req.userId}`);
      return res.status(201).json(log);
    } catch (error: any) {
      console.error(`[LOG ERROR] Failed to save meal log: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
  }

  public static async getMealLogs(req: AuthRequest, res: Response) {
    try {
      const logs = await MealLog.find({ userId: req.userId }).sort({ date: -1 });
      return res.json(logs);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Workout Logs
  public static async saveWorkoutLog(req: AuthRequest, res: Response) {
    try {
      const log = new WorkoutLog({
        ...req.body,
        userId: req.userId
      });
      await log.save();
      
      const completedCount = log.exercises.filter(e => e.completed).length;
      console.log(`[LOG] 💪 Workout Log saved: ${completedCount} of ${log.exercises.length} exercises completed for user ${req.userId}`);
      
      return res.status(201).json(log);
    } catch (error: any) {
      console.error(`[LOG ERROR] Failed to save workout log: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
  }

  public static async getWorkoutLogs(req: AuthRequest, res: Response) {
    try {
      const logs = await WorkoutLog.find({ userId: req.userId }).sort({ date: -1 });
      return res.json(logs);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Burn Logs
  public static async saveBurnLog(req: AuthRequest, res: Response) {
    try {
      const log = new BurnLog({
        ...req.body,
        userId: req.userId
      });
      await log.save();
      console.log(`[LOG] 🔥 Burn Activity saved: ${log.totalCaloriesBurned} kcal total (${log.activities.length} activities) for user ${req.userId}`);
      return res.status(201).json(log);
    } catch (error: any) {
      console.error(`[LOG ERROR] Failed to save burn log: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
  }

  public static async getBurnLogs(req: AuthRequest, res: Response) {
    try {
      const logs = await BurnLog.find({ userId: req.userId }).sort({ date: -1 });
      return res.json(logs);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // AI Workout Plans persistence
  public static async saveWorkoutPlan(req: AuthRequest, res: Response) {
    try {
      const plan = new WeeklyWorkoutPlanModel({
        ...req.body,
        userId: req.userId
      });
      await plan.save();
      return res.status(201).json(plan);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  public static async getWorkoutPlans(req: AuthRequest, res: Response) {
    try {
      const plans = await WeeklyWorkoutPlanModel.find({ userId: req.userId }).sort({ createdAt: -1 });
      return res.json(plans);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
