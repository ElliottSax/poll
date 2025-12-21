/**
 * UltraThink Enhanced Logger
 * Advanced logging with UltraThink-specific features
 */

import pino from 'pino';
import { config } from '../config/env';

// Create base pino logger
const baseLogger = pino({
  level: config.logLevel || 'info',
  transport: config.isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

// Extend with UltraThink features
class UltraThinkLogger {
  private logger = baseLogger;
  private metrics = {
    predictions: 0,
    quantumOps: 0,
    apiCalls: 0,
    errors: 0
  };

  // Standard logging methods
  debug(msg: string, data?: any) {
    this.logger.debug(data, msg);
  }

  info(msg: string, data?: any) {
    this.logger.info(data, msg);
  }

  warn(msg: string, data?: any) {
    this.logger.warn(data, msg);
  }

  error(msg: string, error?: any) {
    this.metrics.errors++;
    this.logger.error(error, msg);
  }

  // UltraThink specific methods
  ultrathink(msg: string, data?: any) {
    this.logger.info({ ...data, ultrathink: true }, `🧠 [UltraThink] ${msg}`);
  }

  prediction(candidateId: string, result: any) {
    this.metrics.predictions++;
    this.logger.info(
      {
        candidateId,
        prediction: result.prediction,
        confidence: result.confidence,
        ultrathink: true,
        type: 'prediction'
      },
      `🔮 Prediction generated for ${candidateId}`
    );
  }

  quantum(operation: string, data?: any) {
    this.metrics.quantumOps++;
    this.logger.info(
      {
        operation,
        ...data,
        ultrathink: true,
        type: 'quantum'
      },
      `⚡ Quantum operation: ${operation}`
    );
  }

  trend(analysis: string, data?: any) {
    this.logger.info(
      {
        analysis,
        ...data,
        ultrathink: true,
        type: 'trend'
      },
      `📊 Trend analysis: ${analysis}`
    );
  }

  // API request logging
  apiRequest(method: string, path: string, duration: number, statusCode: number) {
    this.metrics.apiCalls++;
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this.logger[level](
      {
        method,
        path,
        duration,
        statusCode,
        type: 'api'
      },
      `${method} ${path} ${statusCode} ${duration}ms`
    );
  }

  // Performance logging
  performance(operation: string, duration: number) {
    const level = duration > 1000 ? 'warn' : duration > 500 ? 'info' : 'debug';
    this.logger[level](
      {
        operation,
        duration,
        type: 'performance'
      },
      `Performance: ${operation} completed in ${duration}ms`
    );
  }

  // System events
  startup(config: any) {
    this.logger.info(
      {
        ...config,
        type: 'system',
        event: 'startup'
      },
      '🚀 UltraThink API Server Starting'
    );
  }

  shutdown() {
    this.logger.info(
      {
        metrics: this.metrics,
        type: 'system',
        event: 'shutdown'
      },
      '🛑 UltraThink API Server Shutting Down'
    );
  }

  // Get metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      predictions: 0,
      quantumOps: 0,
      apiCalls: 0,
      errors: 0
    };
  }

  // Create child logger with context
  child(context: any) {
    return this.logger.child(context);
  }
}

// Export singleton instance
export const ultraLogger = new UltraThinkLogger();

// Express middleware
export function ultraLoggerMiddleware(req: any, res: any, next: any) {
  const start = Date.now();
  const reqId = req.headers['x-request-id'] || Math.random().toString(36).substring(7);

  // Attach request ID
  req.reqId = reqId;
  req.log = ultraLogger.child({ reqId });

  // Log request
  req.log.debug(`${req.method} ${req.path}`, {
    query: req.query,
    headers: req.headers
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - start;
    ultraLogger.apiRequest(req.method, req.path, duration, res.statusCode);
    originalSend.call(this, data);
  };

  next();
}

// Export both loggers for compatibility
export { baseLogger as logger };