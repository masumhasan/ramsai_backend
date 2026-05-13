import OpenAI from 'openai';
import { AIService } from './ai.service';
import { WORKOUT_PLAN_SYSTEM_PROMPT, getWorkoutPlanUserPrompt, UserProfile } from '../prompts/workout.prompts';
import { WeeklyWorkoutPlan, WeeklyWorkoutPlanModel } from '../models/ai.model';
import User from '../models/user.model';

export class WorkoutService extends AIService {
  public static async generateWorkoutPlan(profile: UserProfile, userId: string): Promise<WeeklyWorkoutPlan> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: WORKOUT_PLAN_SYSTEM_PROMPT },
      { 
        role: 'user', 
        content: getWorkoutPlanUserPrompt(profile)
      }
    ];

    try {
      const result = await this.getCompletion(messages, 'json_object') as WeeklyWorkoutPlan;
      
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      const plan = new WeeklyWorkoutPlanModel({
        ...result,
        userId,
        startDate,
        endDate
      });
      await plan.save();

      if (result.nutritionalTargets) {
        await User.findByIdAndUpdate(userId, {
          $set: { nutritionalTargets: result.nutritionalTargets }
        });
      }
      
      return plan.toObject();
    } catch (error: any) {
      console.error('Workout generation error:', error);
      throw error;
    }
  }
}
