import OpenAI from 'openai';
import { AIService } from './ai.service';
import { BURN_ANALYSIS_SYSTEM_PROMPT, getBurnAnalysisUserPrompt } from '../prompts/burn.prompts';
import { BurnAnalysisResult } from '../models/ai.model';

export class BurnService extends AIService {
  public static async analyzeActivity(userInput: string): Promise<BurnAnalysisResult> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: BURN_ANALYSIS_SYSTEM_PROMPT },
      { role: 'user', content: getBurnAnalysisUserPrompt(userInput) }
    ];

    try {
      const result = await this.getCompletion(messages, 'json_object');
      return result as BurnAnalysisResult;
    } catch (error: any) {
      console.error('Burn analysis error:', error);
      throw error;
    }
  }
}
