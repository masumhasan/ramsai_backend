"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutService = void 0;
const ai_service_1 = require("./ai.service");
const workout_prompts_1 = require("../prompts/workout.prompts");
const ai_model_1 = require("../models/ai.model");
const user_model_1 = __importDefault(require("../models/user.model"));
class WorkoutService extends ai_service_1.AIService {
    static async generateWorkoutPlan(profile, userId) {
        const messages = [
            { role: 'system', content: workout_prompts_1.WORKOUT_PLAN_SYSTEM_PROMPT },
            {
                role: 'user',
                content: (0, workout_prompts_1.getWorkoutPlanUserPrompt)(profile)
            }
        ];
        try {
            const result = await this.getCompletion(messages, 'json_object');
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            const plan = new ai_model_1.WeeklyWorkoutPlanModel({
                ...result,
                userId,
                startDate,
                endDate
            });
            await plan.save();
            if (result.nutritionalTargets) {
                await user_model_1.default.findByIdAndUpdate(userId, {
                    $set: { nutritionalTargets: result.nutritionalTargets }
                });
            }
            return plan.toObject();
        }
        catch (error) {
            console.error('Workout generation error:', error);
            throw error;
        }
    }
}
exports.WorkoutService = WorkoutService;
