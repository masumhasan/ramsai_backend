"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogController = void 0;
const log_model_1 = require("../models/log.model");
const ai_model_1 = require("../models/ai.model");
const user_model_1 = __importDefault(require("../models/user.model"));
class LogController {
    // Meal Logs
    static async saveMealLog(req, res) {
        try {
            const log = new log_model_1.MealLog({
                ...req.body,
                userId: req.userId
            });
            await log.save();
            console.log(`[LOG] 🍴 Meal Log saved: ${log.dishName} (${log.totalCalories} kcal) for user ${req.userId}`);
            return res.status(201).json(log);
        }
        catch (error) {
            console.error(`[LOG ERROR] Failed to save meal log: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    }
    static async getMealLogs(req, res) {
        try {
            const logs = await log_model_1.MealLog.find({ userId: req.userId }).sort({ date: -1 });
            return res.json(logs);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    // Workout Logs
    static async saveWorkoutLog(req, res) {
        try {
            const log = new log_model_1.WorkoutLog({
                ...req.body,
                userId: req.userId
            });
            await log.save();
            const completedCount = log.exercises.filter(e => e.completed).length;
            console.log(`[LOG] 💪 Workout Log saved: ${completedCount} of ${log.exercises.length} exercises completed for user ${req.userId}`);
            return res.status(201).json(log);
        }
        catch (error) {
            console.error(`[LOG ERROR] Failed to save workout log: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    }
    static async getWorkoutLogs(req, res) {
        try {
            const logs = await log_model_1.WorkoutLog.find({ userId: req.userId }).sort({ date: -1 });
            return res.json(logs);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    // Burn Logs
    static async saveBurnLog(req, res) {
        try {
            const log = new log_model_1.BurnLog({
                ...req.body,
                userId: req.userId
            });
            await log.save();
            console.log(`[LOG] 🔥 Burn Activity saved: ${log.totalCaloriesBurned} kcal total (${log.activities.length} activities) for user ${req.userId}`);
            return res.status(201).json(log);
        }
        catch (error) {
            console.error(`[LOG ERROR] Failed to save burn log: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    }
    static async getBurnLogs(req, res) {
        try {
            const logs = await log_model_1.BurnLog.find({ userId: req.userId }).sort({ date: -1 });
            return res.json(logs);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    static async saveWorkoutPlan(req, res) {
        try {
            const body = req.body;
            const startDate = body.startDate ? new Date(body.startDate) : new Date();
            let endDate = body.endDate ? new Date(body.endDate) : new Date(startDate);
            if (!body.endDate) {
                endDate.setDate(endDate.getDate() + 6);
            }
            const plan = new ai_model_1.WeeklyWorkoutPlanModel({
                ...body,
                userId: req.userId,
                startDate,
                endDate,
            });
            await plan.save();
            console.log(`[LOG] Workout Plan saved: "${plan.planTitle}" (Week ${plan.weekNumber}) for user ${req.userId}`);
            return res.status(201).json(plan);
        }
        catch (error) {
            console.error(`[LOG ERROR] Failed to save workout plan: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    }
    static async getWorkoutPlans(req, res) {
        try {
            const plans = await ai_model_1.WeeklyWorkoutPlanModel.find({ userId: req.userId }).sort({ startDate: -1 });
            return res.json(plans);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    // Weight Logs
    static async saveWeightLog(req, res) {
        try {
            const { weight, notes } = req.body;
            if (!weight) {
                return res.status(400).json({ error: 'weight is required' });
            }
            const user = await user_model_1.default.findById(req.userId);
            const previousWeight = user?.currentWeight ?? undefined;
            const change = previousWeight != null ? +(weight - previousWeight).toFixed(1) : undefined;
            const log = new log_model_1.WeightLog({
                userId: req.userId,
                weight,
                previousWeight,
                change,
                notes,
            });
            await log.save();
            await user_model_1.default.findByIdAndUpdate(req.userId, {
                $set: { currentWeight: weight }
            });
            console.log(`[LOG] Weight Log saved: ${weight} kg (change: ${change ?? 'N/A'}) for user ${req.userId}`);
            return res.status(201).json(log);
        }
        catch (error) {
            console.error(`[LOG ERROR] Failed to save weight log: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    }
    static async getWeightLogs(req, res) {
        try {
            const logs = await log_model_1.WeightLog.find({ userId: req.userId }).sort({ date: -1 });
            return res.json(logs);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
exports.LogController = LogController;
