"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const ai_controller_1 = require("../controllers/ai.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post('/food-scan', auth_middleware_1.authenticate, upload.single('image'), ai_controller_1.AIController.analyzeFood);
router.post('/workout-plan', auth_middleware_1.authenticate, ai_controller_1.AIController.generateWorkoutPlan);
router.post('/analyze-nutrition', auth_middleware_1.authenticate, upload.single('image'), ai_controller_1.AIController.analyzeMacros);
router.post('/analyze-burn', auth_middleware_1.authenticate, ai_controller_1.AIController.analyzeBurn);
router.post('/scan-product', auth_middleware_1.authenticate, ai_controller_1.AIController.scanProduct);
router.post('/scan-label', auth_middleware_1.authenticate, upload.single('image'), ai_controller_1.AIController.scanLabel);
exports.default = router;
