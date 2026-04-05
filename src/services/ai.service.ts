import OpenAI from 'openai';
import { config } from '../config/env';

export class AIService {
  protected static openai = new OpenAI({
    apiKey: config.openaiApiKey,
  });

  protected static async getCompletion(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    responseFormat: 'json_object' | 'text' = 'json_object'
  ) {
    try {
      console.log('--- OpenAI Request ---');
      console.log(`Model: gpt-4o`);
      console.log(`Response Format: ${responseFormat}`);
      // Log human-readable message preview
      messages.forEach((m, i) => {
        const content = typeof m.content === 'string' ? m.content : '[Multimedia Content]';
        console.log(`Message ${i} (${m.role}): ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
      });

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        response_format: { type: responseFormat },
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('AI returned an empty response');
      }

      console.log('--- OpenAI Response Received ---');
      console.log(content.substring(0, 200) + (content.length > 200 ? '...' : ''));
      
      return responseFormat === 'json_object' ? JSON.parse(content) : content;
    } catch (error: any) {
      console.error('!!! AI Service Error:', error);
      throw new Error(`Failed to get AI completion: ${error.message}`);
    }
  }
}
