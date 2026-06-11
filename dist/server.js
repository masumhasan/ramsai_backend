"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const seed_admin_1 = require("./scripts/seed-admin");
const startServer = async () => {
    try {
        const mongoConnected = await (0, database_1.connectDatabase)();
        const openaiConnected = await (0, database_1.checkOpenAIStatus)();
        if (openaiConnected) {
            console.log('OpenAI connected and working');
        }
        else {
            console.warn('OpenAI configured but not verified');
        }
        if (mongoConnected) {
            console.log('MongoDB connected and working');
            await (0, seed_admin_1.seedSuperAdmin)();
        }
        else {
            console.error('MongoDB failed to connect');
        }
        app_1.default.listen(env_1.config.port, () => {
            console.log(`
      --------------------------------------------------
      🚀 GOCAL AI BACKEND IS RUNNING
      --------------------------------------------------
      PORT: ${env_1.config.port}
      ENVIRONMENT: ${env_1.config.nodeEnv}
      HEALTH CHECK: http://localhost:${env_1.config.port}/health
      --------------------------------------------------
      `);
        });
    }
    catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};
startServer();
