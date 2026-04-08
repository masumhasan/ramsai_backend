import mongoose from 'mongoose';
import { config } from './env';

export const connectDatabase = async (): Promise<boolean> => {
  try {
    await mongoose.connect(config.mongodbUri);
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

export const checkOpenAIStatus = async (): Promise<boolean> => {
  // Simple check if API key exists, in a real scenario we might do a light API call
  return !!config.openaiApiKey;
};
