"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const log_controller_1 = require("../controllers/log.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Meal Logs
router.post('/meals', auth_middleware_1.authenticate, log_controller_1.LogController.saveMealLog);
router.get('/meals', auth_middleware_1.authenticate, log_controller_1.LogController.getMealLogs);
// Workout Logs
router.post('/workouts', auth_middleware_1.authenticate, log_controller_1.LogController.saveWorkoutLog);
router.get('/workouts', auth_middleware_1.authenticate, log_controller_1.LogController.getWorkoutLogs);
// Burn Logs
router.post('/burns', auth_middleware_1.authenticate, log_controller_1.LogController.saveBurnLog);
router.get('/burns', auth_middleware_1.authenticate, log_controller_1.LogController.getBurnLogs);
// Workout Plans
router.post('/plans', auth_middleware_1.authenticate, log_controller_1.LogController.saveWorkoutPlan);
router.get('/plans', auth_middleware_1.authenticate, log_controller_1.LogController.getWorkoutPlans);
// Weight Logs
router.post('/weight', auth_middleware_1.authenticate, log_controller_1.LogController.saveWeightLog);
router.get('/weight', auth_middleware_1.authenticate, log_controller_1.LogController.getWeightLogs);
exports.default = router;
