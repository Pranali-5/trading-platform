/**
 * Structured logging utility
 * Provides consistent logging across the application with log levels
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== "production";
  }

  private formatLog(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
      ...(error && { error: { message: error.message, stack: error.stack } }),
    };
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    const entry = this.formatLog(level, message, context, error);

    if (this.isDevelopment) {
      // Pretty print in development
      const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
      console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
        prefix,
        message,
        ...(context ? [context] : []),
        ...(error ? [error] : [])
      );
    } else {
      // JSON format in production for log aggregation
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      this.log("debug", message, context);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context);
  }

  error(
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    this.log("error", message, context, error);
  }
}

export const logger = new Logger();
