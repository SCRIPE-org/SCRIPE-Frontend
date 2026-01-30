/**
 * Console Logger Utility
 * 
 * Provides environment-aware logging that automatically removes logs in production
 * while maintaining development debugging capabilities.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LoggerConfig {
  level: LogLevel;
  enableInProduction: boolean;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.WARN,
      enableInProduction: false,
      prefix: '[App]',
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (process.env.NODE_ENV === 'production' && !this.config.enableInProduction) {
      return false;
    }
    return level >= this.config.level;
  }

  private formatMessage(level: string, message: string, ...args: any[]): [string, ...any[]] {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix ? `${this.config.prefix} ` : '';
    return [`${prefix}[${timestamp}] ${level}: ${message}`, ...args];
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(...this.formatMessage('DEBUG', message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(...this.formatMessage('INFO', message, ...args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(...this.formatMessage('WARN', message, ...args));
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(...this.formatMessage('ERROR', message, ...args));
    }
  }

  // Convenience methods for common use cases
  api(message: string, ...args: any[]): void {
    this.debug(`[API] ${message}`, ...args);
  }

  auth(message: string, ...args: any[]): void {
    this.debug(`[AUTH] ${message}`, ...args);
  }

  ui(message: string, ...args: any[]): void {
    this.debug(`[UI] ${message}`, ...args);
  }

  performance(message: string, ...args: any[]): void {
    this.debug(`[PERF] ${message}`, ...args);
  }
}

// Global logger instance
export const logger = new Logger({
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.WARN,
  enableInProduction: false,
  prefix: '[Next-Frontend-Template]',
});

// Convenience exports
export const { debug, info, warn, error, api, auth, ui, performance } = logger;

// No-op logger for production builds
export const noopLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  api: () => {},
  auth: () => {},
  ui: () => {},
  performance: () => {},
};

// Export appropriate logger based on environment
export const appLogger = process.env.NODE_ENV === 'production' ? noopLogger : logger;
