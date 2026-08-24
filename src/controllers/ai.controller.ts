import { Request, Response } from 'express';
import { FoodService } from '../services/food.service';
import { WorkoutService } from '../services/workout.service';
import { BurnService } from '../services/burn.service';
import { ProductService } from '../services/product.service';
import { checkAndIncrementScanLimit } from '../utils/limit_checker';
import User from '../models/user.model';

export class AIController {
  public static async analyzeFood(req: Request, res: Response) {
    console.log('\n[API Request] POST /api/ai/food-scan');
    
    if (!req.file) {
      console.error('[API Error] No image provided');
      return res.status(400).json({ error: 'No image file provided' });
    }

    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // Enforce daily limit check
      const limitResult = await checkAndIncrementScanLimit(userId, 'foodScans');
      if (!limitResult.allowed) {
        console.warn(`[API Info] Daily food scan limit reached for user: ${userId}`);
        return res.status(402).json({ error: 'LIMIT_REACHED', limitReached: true });
      }

      console.log(`- File Name: ${req.file.originalname}`);
      console.log(`- MIME Type: ${req.file.mimetype}`);
      console.log(`- Size: ${(req.file.size / 1024).toFixed(2)} KB`);

      const language = req.query.lang as string || 'en';

      const result = await FoodService.analyzeFoodImage(
        req.file.buffer, 
        req.file.mimetype,
        language
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

    try {
      // Verify premium status
      const user = await User.findById(userId).select('currentPlan subscriptionStatus').lean();
      const isPremium = user && (user.currentPlan === 'premium' || user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial');
      if (!isPremium) {
        console.warn(`[API Info] Workout plan request blocked. Premium subscription required for user: ${userId}`);
        return res.status(402).json({ error: 'PREMIUM_REQUIRED', limitReached: true });
      }

      console.log(`- UserID: ${userId}`);
      console.log(`- Age: ${profile.age}`);
      console.log(`- Goal: ${profile.goal}`);
      console.log(`- Weight: ${profile.weight}`);
      console.log(`- Schedule: ${profile.workoutDaysPerWeek} days`);

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

  public static async scanProduct(req: Request, res: Response) {
    console.log('\n[API Request] POST /api/ai/scan-product');
    const { barcode } = req.body;
    const language = req.query.lang as string || 'en';

    if (!barcode) {
      console.error('[API Error] Missing barcode parameter');
      return res.status(400).json({ error: 'Missing barcode parameter' });
    }

    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // Enforce daily limit check
      const limitResult = await checkAndIncrementScanLimit(userId, 'productScans');
      if (!limitResult.allowed) {
        console.warn(`[API Info] Daily product scan limit reached for user: ${userId}`);
        return res.status(402).json({ error: 'LIMIT_REACHED', limitReached: true });
      }

      const result = await ProductService.analyzeProductBarcode(barcode, language);
      console.log('[API Success] Product scanned and analyzed successfully');
      return res.json(result);
    } catch (error: any) {
      if (error.message === 'PRODUCT_NOT_FOUND') {
        console.warn(`[API Info] Product not found for barcode: ${barcode}`);
        return res.status(404).json({ error: 'Product not found. Please scan the label instead.' });
      }
      console.error('[API Error] Product scan failed:', error.message);
      return res.status(500).json({ error: 'Internal AI error or Invalid Request' });
    }
  }

  public static async scanLabel(req: Request, res: Response) {
    console.log('\n[API Request] POST /api/ai/scan-label');

    if (!req.file) {
      console.error('[API Error] No image provided for label scan');
      return res.status(400).json({ error: 'No image file provided' });
    }

    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const language = req.query.lang as string || 'en';

    try {
      // Enforce daily limit check
      const limitResult = await checkAndIncrementScanLimit(userId, 'productScans');
      if (!limitResult.allowed) {
        console.warn(`[API Info] Daily product scan limit reached for user: ${userId}`);
        return res.status(402).json({ error: 'LIMIT_REACHED', limitReached: true });
      }

      const result = await ProductService.analyzeProductLabelImage(
        req.file.buffer,
        req.file.mimetype,
        language
      );
      console.log('[API Success] Label OCR and analysis complete');
      return res.json(result);
    } catch (error: any) {
      console.error('[API Error] Label scan failed:', error.message);
      return res.status(500).json({ error: 'Internal AI error or Invalid Request' });
    }
  }
}
