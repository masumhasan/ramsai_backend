import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5000,
  openaiApiKey: process.env.OPENAI_API_KEY,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gocal_ai',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  nodeEnv: process.env.NODE_ENV || 'development',
  emailUser: process.env.EMAIL || '',
  emailPassword: process.env.APP_PASSWORD || '',
};

if (!config.openaiApiKey) {
  throw new Error('OPENAI_API_KEY is not defined in .env file');
}

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI is not defined in .env file, using default');
}
