/**
 * Centralized Error Handling System
 *
 * This module provides consistent error handling patterns across the application
 * with proper logging, user feedback, and error recovery mechanisms.
 */

import { appLogger } from "./logger";

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  context?: string;
}

export interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableUserNotifications: boolean;
  enableErrorReporting: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
}

/**
 * Error codes for consistent error handling
 */
export const ERROR_CODES = {
  // Authentication errors
  AUTH_TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  AUTH_UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  AUTH_FORBIDDEN: "AUTH_FORBIDDEN",

  // Network errors
  NETWORK_TIMEOUT: "NETWORK_TIMEOUT",
  NETWORK_CONNECTION_FAILED: "NETWORK_CONNECTION_FAILED",
  NETWORK_SERVER_ERROR: "NETWORK_SERVER_ERROR",

  // Validation errors
  VALIDATION_REQUIRED_FIELD: "VALIDATION_REQUIRED_FIELD",
  VALIDATION_INVALID_FORMAT: "VALIDATION_INVALID_FORMAT",
  VALIDATION_CONSTRAINT_VIOLATION: "VALIDATION_CONSTRAINT_VIOLATION",

  // Business logic errors
  BUSINESS_RULE_VIOLATION: "BUSINESS_RULE_VIOLATION",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  RESOURCE_ALREADY_EXISTS: "RESOURCE_ALREADY_EXISTS",

  // System errors
  SYSTEM_UNKNOWN_ERROR: "SYSTEM_UNKNOWN_ERROR",
  SYSTEM_CONFIGURATION_ERROR: "SYSTEM_CONFIGURATION_ERROR",
} as const;

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Centralized Error Handler Class
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errorLog: AppError[] = [];

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableUserNotifications: true,
      enableErrorReporting: true,
      logLevel: "error",
      ...config,
    };
  }

  /**
   * Handle and process errors consistently
   */
  handleError(error: Error | AppError, context?: string): AppError {
    const appError = this.normalizeError(error, context);

    // Log error
    if (this.config.enableLogging) {
      this.logError(appError);
    }

    // Report error to external service
    if (this.config.enableErrorReporting) {
      this.reportError(appError);
    }

    // Store in error log
    this.errorLog.push(appError);

    return appError;
  }

  /**
   * Normalize different error types to AppError format
   */
  private normalizeError(error: Error | AppError, context?: string): AppError {
    if ("code" in error && "timestamp" in error) {
      return error as AppError;
    }

    const errorCode = this.determineErrorCode(error);

    return {
      code: errorCode,
      message: error.message || "An unknown error occurred",
      details: error.stack || error,
      timestamp: new Date(),
      context,
    };
  }

  /**
   * Determine error code based on error type and message
   */
  private determineErrorCode(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes("unauthorized") || message.includes("401")) {
      return ERROR_CODES.AUTH_UNAUTHORIZED;
    }

    if (message.includes("forbidden") || message.includes("403")) {
      return ERROR_CODES.AUTH_FORBIDDEN;
    }

    if (message.includes("timeout")) {
      return ERROR_CODES.NETWORK_TIMEOUT;
    }

    if (message.includes("network") || message.includes("connection")) {
      return ERROR_CODES.NETWORK_CONNECTION_FAILED;
    }

    if (message.includes("not found") || message.includes("404")) {
      return ERROR_CODES.RESOURCE_NOT_FOUND;
    }

    if (message.includes("validation") || message.includes("required")) {
      return ERROR_CODES.VALIDATION_REQUIRED_FIELD;
    }

    return ERROR_CODES.SYSTEM_UNKNOWN_ERROR;
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: AppError): void {
    const logMessage = `[${error.code}] ${error.message}`;
    const logData = {
      code: error.code,
      message: error.message,
      context: error.context,
      timestamp: error.timestamp,
      details: error.details,
    };

    switch (this.config.logLevel) {
      case "debug":
        appLogger.debug(logMessage, logData);
        break;
      case "info":
        appLogger.info(logMessage, logData);
        break;
      case "warn":
        appLogger.warn(logMessage, logData);
        break;
      case "error":
      default:
        appLogger.error(logMessage, logData);
        break;
    }
  }

  /**
   * Report error to external monitoring service
   */
  private reportError(error: AppError): void {
    // In production, this would send to services like Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === "production") {
      // Example: Sentry.captureException(error);
      appLogger.warn("Error reporting to external service:", error);
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: AppError): string {
    const messages: Record<string, string> = {
      [ERROR_CODES.AUTH_TOKEN_EXPIRED]:
        "Your session has expired. Please log in again.",
      [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: "Invalid username or password.",
      [ERROR_CODES.AUTH_UNAUTHORIZED]:
        "You are not authorized to perform this action.",
      [ERROR_CODES.AUTH_FORBIDDEN]:
        "Access denied. You do not have permission.",
      [ERROR_CODES.NETWORK_TIMEOUT]: "Request timed out. Please try again.",
      [ERROR_CODES.NETWORK_CONNECTION_FAILED]:
        "Connection failed. Please check your internet connection.",
      [ERROR_CODES.NETWORK_SERVER_ERROR]:
        "Server error. Please try again later.",
      [ERROR_CODES.VALIDATION_REQUIRED_FIELD]:
        "Please fill in all required fields.",
      [ERROR_CODES.VALIDATION_INVALID_FORMAT]:
        "Please check the format of your input.",
      [ERROR_CODES.RESOURCE_NOT_FOUND]: "The requested resource was not found.",
      [ERROR_CODES.RESOURCE_ALREADY_EXISTS]: "This resource already exists.",
      [ERROR_CODES.SYSTEM_UNKNOWN_ERROR]:
        "An unexpected error occurred. Please try again.",
    };

    return messages[error.code] || error.message;
  }

  /**
   * Get error severity level
   */
  getErrorSeverity(error: AppError): ErrorSeverity {
    const severityMap: Record<string, ErrorSeverity> = {
      [ERROR_CODES.AUTH_TOKEN_EXPIRED]: ErrorSeverity.MEDIUM,
      [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: ErrorSeverity.MEDIUM,
      [ERROR_CODES.AUTH_UNAUTHORIZED]: ErrorSeverity.HIGH,
      [ERROR_CODES.AUTH_FORBIDDEN]: ErrorSeverity.HIGH,
      [ERROR_CODES.NETWORK_TIMEOUT]: ErrorSeverity.MEDIUM,
      [ERROR_CODES.NETWORK_CONNECTION_FAILED]: ErrorSeverity.HIGH,
      [ERROR_CODES.NETWORK_SERVER_ERROR]: ErrorSeverity.HIGH,
      [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: ErrorSeverity.LOW,
      [ERROR_CODES.VALIDATION_INVALID_FORMAT]: ErrorSeverity.LOW,
      [ERROR_CODES.RESOURCE_NOT_FOUND]: ErrorSeverity.MEDIUM,
      [ERROR_CODES.RESOURCE_ALREADY_EXISTS]: ErrorSeverity.MEDIUM,
      [ERROR_CODES.SYSTEM_UNKNOWN_ERROR]: ErrorSeverity.CRITICAL,
    };

    return severityMap[error.code] || ErrorSeverity.MEDIUM;
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): AppError[] {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }
}

/**
 * Global error handler instance
 */
export const globalErrorHandler = new ErrorHandler({
  enableLogging: process.env.NODE_ENV === "development",
  enableUserNotifications: true,
  enableErrorReporting: process.env.NODE_ENV === "production",
  logLevel: process.env.NODE_ENV === "development" ? "debug" : "error",
});

/**
 * Utility function to handle errors consistently
 */
export function handleError(
  error: Error | AppError,
  context?: string
): AppError {
  return globalErrorHandler.handleError(error, context);
}

/**
 * Utility function to get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: Error | AppError): string {
  const appError =
    error instanceof Error ? globalErrorHandler.handleError(error) : error;

  return globalErrorHandler.getUserFriendlyMessage(appError);
}
