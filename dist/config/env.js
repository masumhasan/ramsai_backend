"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
exports.config = {
    port: process.env.PORT || 5000,
    openaiApiKey: process.env.OPENAI_API_KEY,
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gocal_ai',
    jwtSecret: process.env.JWT_SECRET || 'secret',
    nodeEnv: process.env.NODE_ENV || 'development',
    emailUser: process.env.EMAIL || '',
    emailPassword: process.env.APP_PASSWORD || '',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    awsS3BucketName: process.env.AWS_S3_BUCKET_NAME || 'gocalai',
    rcWebhookUrl: process.env.RC_WEBHOOK_URL || '',
    rcBearer: process.env.RC_BEARER || '',
    rcApiKey: process.env.RC_GOCALAI_API_KEY || '',
};
if (!exports.config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not defined in .env file');
}
if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not defined in .env file, using default');
}
