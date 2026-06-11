"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_1 = __importDefault(require("openai"));
const env_1 = require("../config/env");
class AIService {
    static async getCompletion(messages, responseFormat = 'json_object') {
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
        }
        catch (error) {
            console.error('!!! AI Service Error:', error);
            throw new Error(`Failed to get AI completion: ${error.message}`);
        }
    }
}
exports.AIService = AIService;
AIService.openai = new openai_1.default({
    apiKey: env_1.config.openaiApiKey,
});
