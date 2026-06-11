"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOpenAIStatus = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDatabase = async () => {
    try {
        await mongoose_1.default.connect(env_1.config.mongodbUri);
        return true;
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        return false;
    }
};
exports.connectDatabase = connectDatabase;
const checkOpenAIStatus = async () => {
    // Simple check if API key exists, in a real scenario we might do a light API call
    return !!env_1.config.openaiApiKey;
};
exports.checkOpenAIStatus = checkOpenAIStatus;
