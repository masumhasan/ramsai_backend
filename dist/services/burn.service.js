"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnService = void 0;
const ai_service_1 = require("./ai.service");
const burn_prompts_1 = require("../prompts/burn.prompts");
class BurnService extends ai_service_1.AIService {
    static async analyzeActivity(userInput) {
        const messages = [
            { role: 'system', content: burn_prompts_1.BURN_ANALYSIS_SYSTEM_PROMPT },
            { role: 'user', content: (0, burn_prompts_1.getBurnAnalysisUserPrompt)(userInput) }
        ];
        try {
            const result = await this.getCompletion(messages, 'json_object');
            return result;
        }
        catch (error) {
            console.error('Burn analysis error:', error);
            throw error;
        }
    }
}
exports.BurnService = BurnService;
