import { Request, Response } from 'express';
import { FoodService } from '../services/food.service';
import { WorkoutService } from '../services/workout.service';
import { BurnService } from '../services/burn.service';

export class AIController {
  public static async analyzeFood(req: Request, res: Response) {
    console.log('\n[API Request] POST /api/ai/food-scan');
    // ... Existing logic ...
    if (!req.file) {
      console.error('[API Error] No image provided');
      return res.status(400).json({ error: 'No image file provided' });
    }
    console.log(`- File Name: ${req.file.originalname}`);
    console.log(`- MIME Type: ${req.file.mimetype}`);
    console.log(`- Size: ${(req.file.size / 1024).toFixed(2)} KB`);

    try {
      const result = await FoodService.analyzeFoodImage(
        req.file.buffer, 
        req.file.mimetype
      );
      console.log('[API Success] Analysis complete');
      return res.json(result);
    } catch (error: any) {
      console.error('[API Error] AI analysis failed:', error.message);
      return res.status(500).json({ error: 'Internal AI error or Invalid Request' });
    }
  }

  public static async generateWorkoutPlan(req: Request, res: Response) {
    console.log('\n[API Request] POST /api/ai/workout-plan');
    const profile = req.body;
    const userId = (req as any).userId;

    if (!userId) {
      console.error('[API Error] Unauthorized request for workout plan');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log(`- UserID: ${userId}`);
    console.log(`- Age: ${profile.age}`);
    console.log(`- Goal: ${profile.goal}`);
    console.log(`- Weight: ${profile.weight}`);
    console.log(`- Schedule: ${profile.workoutDaysPerWeek} days`);

    try {
      const result = await WorkoutService.generateWorkoutPlan(profile, userId);
      console.log('[API Success] Detailed workout plan generated and saved');
      return res.json(result);
    } catch (error: any) {
      console.error('[API Error] High-fidelity plan generation failed:', error.message);
      return res.status(500).json({ error: 'Internal AI error or Invalid Request' });
    }
  }

  public static async analyzeBurn(req: Request, res: Response) {
    console.log('\n[API Request] POST /api/ai/analyze-burn');
    const { activityDescription } = req.body;

    if (!activityDescription) {
      console.error('[API Error] Missing activity description');
      return res.status(400).json({ error: 'Missing activity description' });
    }

    console.log(`- Input: "${activityDescription.substring(0, 50)}..."`);

    try {
      const result = await BurnService.analyzeActivity(activityDescription);
      console.log(`[API Success] ${result.activities.length} activities analyzed. Total Burn: ${result.totalCaloriesBurned} kcal`);
      return res.json(result);
    } catch (error: any) {
      console.error('[API Error] Burn analysis failed:', error.message);
      return res.status(500).json({ error: 'Internal AI error or Invalid Request' });
    }
  }

  public static async analyzeMacros(req: Request, res: Response) {
    return AIController.analyzeFood(req, res);
  }
}
