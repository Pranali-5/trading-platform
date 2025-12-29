import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { logger } from "./logger.js";

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    stack?: string;
  };
}

/**
 * Centralized error handling middleware
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn("Application error", {
      statusCode: err.statusCode,
      message: err.message,
    });

    const response: ErrorResponse = {
      error: {
        message: err.message,
      },
    };

    if (process.env.NODE_ENV !== "production") {
      response.error.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Unexpected errors
  logger.error("Unexpected error", err, {
    name: err.name,
    message: err.message,
  });

  const response: ErrorResponse = {
    error: {
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    },
  };

  if (process.env.NODE_ENV !== "production") {
    response.error.stack = err.stack;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
