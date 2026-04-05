import OpenAI from 'openai';
import { AIService } from './ai.service';
import { WORKOUT_PLAN_SYSTEM_PROMPT, getWorkoutPlanUserPrompt, UserProfile } from '../prompts/workout.prompts';
import { WeeklyWorkoutPlan } from '../models/ai.model';

export class WorkoutService extends AIService {
  public static async generateWorkoutPlan(profile: UserProfile): Promise<WeeklyWorkoutPlan> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: WORKOUT_PLAN_SYSTEM_PROMPT },
      { 
        role: 'user', 
        content: getWorkoutPlanUserPrompt(profile)
      }
    ];

    try {
      const result = await this.getCompletion(messages, 'json_object');
      return result as WeeklyWorkoutPlan;
    } catch (error: any) {
      console.error('Workout generation error:', error);
      throw error;
    }
  }
}
