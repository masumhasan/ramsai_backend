"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodService = void 0;
const ai_service_1 = require("./ai.service");
const food_prompts_1 = require("../prompts/food.prompts");
class FoodService extends ai_service_1.AIService {
    static async analyzeFoodImage(imageBuffer, mimeType, language = 'en') {
        // OpenAI vision only supports common image types. If it's octet-stream, default to jpeg.
        let finalMimeType = mimeType;
        if (mimeType === 'application/octet-stream' || !mimeType.startsWith('image/')) {
            finalMimeType = 'image/jpeg';
            console.log(`[FoodService] Overriding invalid MIME type (${mimeType}) with image/jpeg`);
        }
        const base64Image = imageBuffer.toString('base64');
        const dataUrl = `data:${finalMimeType};base64,${base64Image}`;
        const messages = [
            { role: 'system', content: (0, food_prompts_1.FOOD_ANALYSIS_SYSTEM_PROMPT)(language) },
            {
                role: 'user',
                content: [
                    { type: 'text', text: (0, food_prompts_1.getFoodAnalysisUserPrompt)(language) },
                    { type: 'image_url', image_url: { url: dataUrl } }
                ]
            }
        ];
        try {
            const result = await this.getCompletion(messages, 'json_object');
            return result;
        }
        catch (error) {
            console.error('Food analysis error:', error);
            throw error;
        }
    }
}
exports.FoodService = FoodService;
