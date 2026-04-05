import OpenAI from 'openai';
import { AIService } from './ai.service';
import { FOOD_ANALYSIS_SYSTEM_PROMPT, getFoodAnalysisUserPrompt } from '../prompts/food.prompts';
import { FoodAnalysisResult } from '../models/ai.model';

export class FoodService extends AIService {
  public static async analyzeFoodImage(imageBuffer: Buffer, mimeType: string): Promise<FoodAnalysisResult> {
    // OpenAI vision only supports common image types. If it's octet-stream, default to jpeg.
    let finalMimeType = mimeType;
    if (mimeType === 'application/octet-stream' || !mimeType.startsWith('image/')) {
      finalMimeType = 'image/jpeg'; 
      console.log(`[FoodService] Overriding invalid MIME type (${mimeType}) with image/jpeg`);
    }

    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${finalMimeType};base64,${base64Image}`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: FOOD_ANALYSIS_SYSTEM_PROMPT },
      { 
        role: 'user', 
        content: [
          { type: 'text', text: getFoodAnalysisUserPrompt() },
          { type: 'image_url', image_url: { url: dataUrl } }
        ]
      }
    ];

    try {
      const result = await this.getCompletion(messages, 'json_object');
      return result as FoodAnalysisResult;
    } catch (error: any) {
      console.error('Food analysis error:', error);
      throw error;
    }
  }
}
