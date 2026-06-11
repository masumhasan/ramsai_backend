import app from './app';
import { config } from './config/env';
import { connectDatabase, checkOpenAIStatus } from './config/database';
import { seedSuperAdmin } from './scripts/seed-admin';

const startServer = async () => {
  try {
    const mongoConnected = await connectDatabase();
    const openaiConnected = await checkOpenAIStatus();

    if (openaiConnected) {
      console.log('OpenAI connected and working');
    } else {
      console.warn('OpenAI configured but not verified');
    }

    if (mongoConnected) {
      console.log('MongoDB connected and working');
      await seedSuperAdmin();
    } else {
      console.error('MongoDB failed to connect');
    }

    app.listen(config.port, () => {
      console.log(`
      --------------------------------------------------
      🚀 GOCAL AI BACKEND IS RUNNING
      --------------------------------------------------
      PORT: ${config.port}
      ENVIRONMENT: ${config.nodeEnv}
      HEALTH CHECK: http://localhost:${config.port}/health
      --------------------------------------------------
      `);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
