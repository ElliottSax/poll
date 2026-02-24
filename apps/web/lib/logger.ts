/**
 * UltraThink Logger Configuration
 * Centralized logging for the web application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  ultrathink?: boolean;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';
  private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.logLevel];
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = entry.ultrathink ? '🧠 [UltraThink]' : '';
    const timestamp = this.isDevelopment ? '' : `[${entry.timestamp}]`;
    const level = `[${entry.level.toUpperCase()}]`;
    const context = entry.context ? `[${entry.context}]` : '';

    return `${timestamp}${level}${context} ${prefix} ${entry.message}`;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      ultrathink: context?.toLowerCase().includes('ultrathink')
    };

    // Add to buffer for debugging
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    const formattedMessage = this.formatMessage(entry);

    // Console output with colors in development
    if (typeof window !== 'undefined' && window.console) {
      const styles = {
        debug: 'color: gray',
        info: 'color: blue',
        warn: 'color: orange',
        error: 'color: red'
      };

      if (this.isDevelopment) {
        console.log(`%c${formattedMessage}`, styles[level]);
        if (data) {
          console.log('Data:', data);
        }
      } else {
        // Production: structured logging
        const logData = { ...entry };
        switch (level) {
          case 'error':
            console.error(formattedMessage, data);
            break;
          case 'warn':
            console.warn(formattedMessage, data);
            break;
          default:
            console.log(formattedMessage, data);
        }
      }
    }

    // Send to remote logging service in production
    if (!this.isDevelopment && level === 'error') {
      this.sendToRemote(entry);
    }
  }

  private sendToRemote(entry: LogEntry) {
    // Send to logging service (e.g., Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined') {
      // Only send errors in production
      const endpoint = process.env.NEXT_PUBLIC_LOG_ENDPOINT;
      if (endpoint) {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...entry,
            userAgent: window.navigator.userAgent,
            url: window.location.href,
            app: 'ultrathink-web'
          })
        }).catch(() => {
          // Silently fail - don't create error loops
        });
      }
    }
  }

  // Public methods
  debug(message: string, context?: string, data?: any) {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: any) {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: any) {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, data?: any) {
    this.log('error', message, context, data);
  }

  // UltraThink specific logging
  ultrathink(message: string, data?: any) {
    this.log('info', message, 'UltraThink', data);
  }

  // Performance logging
  performance(operation: string, duration: number) {
    const message = `Operation completed in ${duration}ms`;
    const level: LogLevel = duration > 1000 ? 'warn' : 'info';
    this.log(level, message, `Performance:${operation}`, { duration });
  }

  // Get recent logs for debugging
  getRecentLogs(count?: number): LogEntry[] {
    return this.logBuffer.slice(-(count || 20));
  }

  // Clear log buffer
  clearLogs() {
    this.logBuffer = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }
}

// Create singleton instance
export const logger = new Logger();

// Performance monitoring helper
export function measurePerformance<T>(
  operation: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();

  const logDuration = () => {
    const duration = performance.now() - start;
    logger.performance(operation, duration);
  };

  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.finally(logDuration);
    }
    logDuration();
    return result;
  } catch (error) {
    logDuration();
    logger.error(`Operation failed: ${operation}`, 'Performance', error);
    throw error;
  }
}

// React hook for logging component lifecycle
export function useLogger(componentName: string) {
  if (typeof window !== 'undefined') {
    logger.debug(`Component mounted`, componentName);

    // Return cleanup function for unmount
    return () => {
      logger.debug(`Component unmounted`, componentName);
    };
  }
}

export default logger;