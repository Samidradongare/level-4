import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// Initialize Sentry if DSN is set
if (env.SENTRY_DSN) {
  Sentry.init({ dsn: env.SENTRY_DSN });
  logger.info('Sentry error tracking initialized.');
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error(`Error in endpoint ${req.method} ${req.originalUrl}: ${err.message}`);
  
  if (err.stack) {
    logger.debug(err.stack);
  }

  if (env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
}
