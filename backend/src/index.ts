import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { logger } from './utils/logger';
import { initDatabase } from './config/database';
import { requestLogger } from './middleware/logging';
import { errorHandler } from './middleware/errorHandler';
import { reconciliationService } from './services/reconciliationService';

// Import Route Handlers
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import usageRoutes from './routes/usage';
import analyticsRoutes from './routes/analytics';
import { initSentry } from './utils/setup-sentry';

// Initialize Sentry Tracking
initSentry(env.NODE_ENV);

const app = express();

// Configure CORS
const corsOptions = {
  origin: function (origin: any, callback: any) {
    const isVercelOrigin = origin && (origin.endsWith('.vercel.app') || /^https:\/\/.*\.vercel\.app$/.test(origin));
    if (!origin || env.FREIGHTER_ALLOWED_ORIGINS.indexOf(origin) !== -1 || env.FREIGHTER_ALLOWED_ORIGINS.includes('*') || isVercelOrigin) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blockage: origin ${origin} is not allowed.`));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use(requestLogger);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Setup API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/analytics', analyticsRoutes);

// Catch-all 404 Route
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: { message: `Requested route ${req.method} ${req.originalUrl} not found.` }
  });
});

// Global Error Handler (must be registered last)
app.use(errorHandler);

// Start Server and jobs
const PORT = env.PORT;

async function startServer() {
  // Initialize Database Pool & Schemas
  await initDatabase();

  app.listen(PORT, () => {
    logger.info(`=== UsagePay Backend listening on port ${PORT} [Mode: ${env.NODE_ENV}] ===`);
    
    // Start interval reconciliation job (runs based on config in seconds)
    const reconciliationIntervalMs = env.RECONCILIATION_INTERVAL * 1000;
    setInterval(() => {
      reconciliationService.runHourlyReconciliation()
        .catch(err => logger.error(`Background reconciliation error: ${err.message}`));
    }, reconciliationIntervalMs);
    
    logger.info(`Reconciliation cron job registered. Run interval: every ${env.RECONCILIATION_INTERVAL} seconds.`);
  });
}

startServer().catch(err => {
  logger.error(`Critical backend startup failure: ${err.message}`);
  process.exit(1);
});
