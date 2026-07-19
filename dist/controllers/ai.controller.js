"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const food_service_1 = require("../services/food.service");
const workout_service_1 = require("../services/workout.service");
const burn_service_1 = require("../services/burn.service");
const product_service_1 = require("../services/product.service");
class AIController {
    static async analyzeFood(req, res) {
        console.log('\n[API Request] POST /api/ai/food-scan');
        // ... Existing logic ...
        if (!req.file) {
            console.error('[API Error] No image provided');
            return res.status(400).json({ error: 'No image file provided' });
        }
        console.log(`- File Name: ${req.file.originalname}`);
        console.log(`- MIME Type: ${req.file.mimetype}`);
        console.log(`- Size: ${(req.file.size / 1024).toFixed(2)} KB`);
        const language = req.query.lang || 'en';
        try {
            const result = await food_service_1.FoodService.analyzeFoodImage(req.file.buffer, req.file.mimetype, language);
            console.log('[API Success] Analysis complete');
            return res.json(result);
        }
        catch (error) {
            console.error('[API Error] AI analysis failed:', error.message);
            return res.status(500).json({ error: 'Internal AI error or Invalid Request' });
        }
    }
    static async generateWorkoutPlan(req, res) {
        console.log('\n[API Request] POST /api/ai/workout-plan');
        const profile = req.body;
        const userId = req.userId;
        if (!userId) {
            console.error('[API Error] Unauthorized request for workout plan');
            return res.status(401).json({ error: 'Authentication required' });
        }
        console.log(`- UserID: ${userId}`);
        console.log(`- Age: ${profile.age}`);
        console.log(`- Goal: ${profile.goal}`);
        console.log(`- Weight: ${profile.weight}`);
        console.log(`- Schedule: ${profile.workoutDaysPerWeek} days`);
        try {
            const result = await workout_service_1.WorkoutService.generateWorkoutPlan(profile, userId);
            console.log('[API Success] Detailed workout plan generated and saved');
            return res.json(result);
        }
        catch (error) {
            console.error('[API Error] High-fidelity plan generation failed:', error.message);
            return res.status(500).json({ error: 'Internal AI error or Invalid Request' });
        }
    }
    static async analyzeBurn(req, res) {
        console.log('\n[API Request] POST /api/ai/analyze-burn');
        const { activityDescription } = req.body;
        if (!activityDescription) {
            console.error('[API Error] Missing activity description');
            return res.status(400).json({ error: 'Missing activity description' });
        }
        console.log(`- Input: "${activityDescription.substring(0, 50)}..."`);
        try {
            const result = await burn_service_1.BurnService.analyzeActivity(activityDescription);
            console.log(`[API Success] ${result.activities.length} activities analyzed. Total Burn: ${result.totalCaloriesBurned} kcal`);
            return res.json(result);
        }
        catch (error) {
            console.error('[API Error] Burn analysis failed:', error.message);
            return res.status(500).json({ error: 'Internal AI error or Invalid Request' });
        }
    }
    static async analyzeMacros(req, res) {
        return AIController.analyzeFood(req, res);
    }
    static async scanProduct(req, res) {
        console.log('\n[API Request] POST /api/ai/scan-product');
        const { barcode } = req.body;
        const language = req.query.lang || 'en';
        if (!barcode) {
            console.error('[API Error] Missing barcode parameter');
            return res.status(400).json({ error: 'Missing barcode parameter' });
        }
        try {
            const result = await product_service_1.ProductService.analyzeProductBarcode(barcode, language);
            console.log('[API Success] Product scanned and analyzed successfully');
            return res.json(result);
        }
        catch (error) {
            if (error.message === 'PRODUCT_NOT_FOUND') {
                console.warn(`[API Info] Product not found for barcode: ${barcode}`);
                return res.status(404).json({ error: 'Product not found. Please scan the label instead.' });
            }
            console.error('[API Error] Product scan failed:', error.message);
            return res.status(500).json({ error: 'Internal AI error or Invalid Request' });
        }
    }
    static async scanLabel(req, res) {
        console.log('\n[API Request] POST /api/ai/scan-label');
        if (!req.file) {
            console.error('[API Error] No image provided for label scan');
            return res.status(400).json({ error: 'No image file provided' });
        }
        const language = req.query.lang || 'en';
        try {
            const result = await product_service_1.ProductService.analyzeProductLabelImage(req.file.buffer, req.file.mimetype, language);
            console.log('[API Success] Label OCR and analysis complete');
            return res.json(result);
        }
        catch (error) {
            console.error('[API Error] Label scan failed:', error.message);
            return res.status(500).json({ error: 'Internal AI error or Invalid Request' });
        }
    }
}
exports.AIController = AIController;
