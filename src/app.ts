import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import aiRoutes from './routes/ai.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import logRoutes from './routes/log.routes';
import adminRoutes from './routes/admin.routes';
import subscriptionRoutes from './routes/subscription.routes';

const app = express();

// Security & Logging
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(morgan('dev'));

// Body Parser for JSON (Limited for security)
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

export default app;
