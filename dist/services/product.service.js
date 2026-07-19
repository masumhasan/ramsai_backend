"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const axios_1 = __importDefault(require("axios"));
const ai_service_1 = require("./ai.service");
const product_prompts_1 = require("../prompts/product.prompts");
class ProductService extends ai_service_1.AIService {
    /**
     * Scan product by barcode.
     */
    static async analyzeProductBarcode(barcode, language = 'en') {
        console.log(`[ProductService] Scanning barcode: ${barcode} (lang: ${language})`);
        // 1. Check local mock products
        if (this.MOCK_PRODUCTS[barcode]) {
            console.log(`- Found mock product for barcode: ${barcode}`);
            return this.translateMockIfNeeded(this.MOCK_PRODUCTS[barcode], language);
        }
        // 2. Query Open Food Facts API
        try {
            const offUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
            console.log(`- Querying Open Food Facts: ${offUrl}`);
            const response = await axios_1.default.get(offUrl, { timeout: 8000 });
            if (response.data && response.data.status === 1 && response.data.product) {
                const p = response.data.product;
                const productName = p.product_name || p.product_name_en || 'Unknown Product';
                const category = p.categories_hierarchy?.[0]?.replace('en:', '').toUpperCase() || p.categories || 'PACKAGED FOOD';
                const ingredientsText = p.ingredients_text || p.ingredients_text_en || '';
                const quantity = p.quantity || '';
                console.log(`- Product identified: "${productName}". Analyzing with OpenAI...`);
                // 3. Compile and analyze using OpenAI
                const messages = [
                    { role: 'system', content: (0, product_prompts_1.PRODUCT_ANALYSIS_SYSTEM_PROMPT)(language) },
                    { role: 'user', content: (0, product_prompts_1.getProductBarcodeUserPrompt)(productName, category, ingredientsText, language) }
                ];
                const analysisResult = await this.getCompletion(messages, 'json_object');
                // Ensure some metadata fields from Open Food Facts are merged if OpenAI left them empty
                if (!analysisResult.subtext && quantity) {
                    analysisResult.subtext = quantity;
                }
                return analysisResult;
            }
        }
        catch (offError) {
            console.error(`- Open Food Facts error: ${offError.message}`);
        }
        // 4. If product not found in mock or OFF, throw not found error so client falls back to OCR scan
        console.log(`- Product not found for barcode: ${barcode}`);
        throw new Error('PRODUCT_NOT_FOUND');
    }
    /**
     * Scan product by image (OCR Vision fallback).
     */
    static async analyzeProductLabelImage(imageBuffer, mimeType, language = 'en') {
        console.log(`[ProductService] Analyzing label image (lang: ${language})`);
        let finalMimeType = mimeType;
        if (mimeType === 'application/octet-stream' || !mimeType.startsWith('image/')) {
            finalMimeType = 'image/jpeg';
        }
        const base64Image = imageBuffer.toString('base64');
        const dataUrl = `data:${finalMimeType};base64,${base64Image}`;
        const messages = [
            { role: 'system', content: (0, product_prompts_1.PRODUCT_ANALYSIS_SYSTEM_PROMPT)(language) },
            {
                role: 'user',
                content: [
                    { type: 'text', text: (0, product_prompts_1.getProductLabelUserPrompt)(language) },
                    { type: 'image_url', image_url: { url: dataUrl } }
                ]
            }
        ];
        try {
            const result = await this.getCompletion(messages, 'json_object');
            return result;
        }
        catch (error) {
            console.error('Vision label analysis error:', error);
            throw error;
        }
    }
    /**
     * Helper to translate mock data if language is not English
     */
    static async translateMockIfNeeded(mockProduct, language) {
        if (language === 'en') {
            return mockProduct;
        }
        console.log(`- Translating mock product details to ${language} using OpenAI...`);
        const prompt = `Translate the following product analysis JSON to the language "${language}". Keep numerical values and status keys (safe, warning, danger) unchanged. Maintain the exact JSON structure.
Product JSON: ${JSON.stringify(mockProduct)}`;
        const messages = [
            { role: 'system', content: 'You are a translation assistant. Output translation ONLY as a valid JSON object.' },
            { role: 'user', content: prompt }
        ];
        try {
            const translated = await this.getCompletion(messages, 'json_object');
            return translated;
        }
        catch (err) {
            console.error('Mock translation failed, returning default English:', err);
            return mockProduct;
        }
    }
}
exports.ProductService = ProductService;
// Mock products matching Stitch design screens for reliable testing and demos
ProductService.MOCK_PRODUCTS = {
    // Bottled Water (Alpine Spring Reserve)
    '7501031302838': {
        productName: 'Alpine Spring Reserve',
        category: 'BOTTLED WATER',
        subtext: '750ml • Pristine Sourcing',
        qualityScore: 85,
        qualityRating: 'Excellent',
        novaScale: 1,
        novaRating: 'Unprocessed',
        nutritionFacts: {
            calories: '0 kcal',
            totalFat: '0g',
            sodium: '2.4mg',
            additionalVitamins: [
                { name: 'Magnesium', value: '14mg', isHealthy: true },
                { name: 'Calcium', value: '42mg', isHealthy: true }
            ]
        },
        ingredients: ['Natural Spring Water', 'Electrolytes', 'Trace Minerals'],
        additivesAlert: 'No artificial additives, sugars, or preservatives detected in recent laboratory testing.',
        allergens: [],
        contaminants: [
            { name: 'Microplastics', value: 'Not Detected (Testing Threshold <1um)', status: 'safe' },
            { name: 'Heavy Metals', value: 'Below detectable limits for Lead, Arsenic', status: 'safe' },
            { name: 'Fluoride Content', value: '0.7mg/L - Higher than baseline average', status: 'danger' }
        ]
    },
    // Packaged Food (Protein Bar)
    '12345678': {
        productName: 'PowerBar Protein Plus',
        category: 'PACKAGED FOOD',
        subtext: '55g • Peanut Butter Caramel',
        qualityScore: 68,
        qualityRating: 'Good',
        novaScale: 4,
        novaRating: 'Ultra-Processed',
        nutritionFacts: {
            calories: '210 kcal',
            totalFat: '6g',
            saturatedFat: '3g',
            sodium: '200mg',
            carbs: '24g',
            sugar: '8g',
            protein: '20g',
            additionalVitamins: [
                { name: 'Iron', value: '2.7mg', isHealthy: true },
                { name: 'Calcium', value: '100mg', isHealthy: true }
            ]
        },
        ingredients: [
            'Soy Protein Isolate',
            'Whey Protein Concentrate',
            'Peanuts',
            'Milk Chocolate Coating',
            'Sugar',
            'Caramel Sauce',
            'Glycerin',
            'Natural Flavors'
        ],
        additivesAlert: 'Contains emulsifiers (Soy Lecithin) and processing aids (Glycerin). Use in moderation.',
        allergens: ['Peanuts', 'Milk', 'Soy'],
        contaminants: [
            { name: 'Microplastics', value: 'Not Detected', status: 'safe' },
            { name: 'Heavy Metals', value: 'Within permissible international standards', status: 'safe' }
        ]
    }
};
