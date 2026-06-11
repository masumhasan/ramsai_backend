"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const user_model_1 = __importDefault(require("../models/user.model"));
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        req.userId = decoded.userId;
        const user = await user_model_1.default.findById(decoded.userId).select('role lastActiveAt').lean();
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.userRole = user.role;
        // Update lastActiveAt without blocking the request
        user_model_1.default.findByIdAndUpdate(decoded.userId, { lastActiveAt: new Date() }).exec();
        next();
    }
    catch (error) {
        console.error('JWT Verification Error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
