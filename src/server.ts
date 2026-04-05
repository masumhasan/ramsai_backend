import app from './app';
import { config } from './config/env';

const startServer = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`
      --------------------------------------------------
      🚀 RAMSAI AI BACKEND IS RUNNING
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
