import { Request, Response } from 'express';
import { FoodService } from '../services/food.service';
import { WorkoutService } from '../services/workout.service';

export class AIController {
  public static async analyzeFood(req: Request, res: Response) {
    console.log('\n[API Request] POST /api/ai/food-scan');
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
    
    console.log(`- Age: ${profile.age}`);
    console.log(`- Goal: ${profile.goal}`);
    console.log(`- Weight: ${profile.weight}`);
    console.log(`- Schedule: ${profile.workoutDaysPerWeek} days`);

    try {
      const result = await WorkoutService.generateWorkoutPlan(profile);
      console.log('[API Success] Detailed workout plan generated');
      return res.json(result);
    } catch (error: any) {
      console.error('[API Error] High-fidelity plan generation failed:', error.message);
      return res.status(500).json({ error: 'Internal AI error or Invalid Request' });
    }
  }

  public static async analyzeMacros(req: Request, res: Response) {
    // Similar to analyzeFood but focuses only on nutrition data if needed.
    // For now, mapping to analyzeFood since it does both items and macros.
    return AIController.analyzeFood(req, res);
  }
}
