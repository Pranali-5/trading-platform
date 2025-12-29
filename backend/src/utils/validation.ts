import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "./errors.js";
import { StatusCodes } from "http-status-codes";

/**
 * Validation schemas for API endpoints
 */
export const watchlistSchemas = {
  createWatchlist: z.object({
    name: z.string().min(1).max(100).trim(),
    userId: z.string().min(1).max(100).trim(),
  }),

  addItem: z.object({
    symbol: z.string().min(1).max(20).trim().toUpperCase(),
  }),

  getWatchlists: z.object({
    userId: z.string().min(1).max(100).trim(),
  }),

  watchlistId: z.object({
    id: z.string().regex(/^\d+$/).transform(Number),
  }),

  symbol: z.object({
    symbol: z.string().min(1).max(20).trim().toUpperCase(),
  }),
};

/**
 * Validation middleware factory
 */
export function validate<T extends z.ZodType>(
  schema: T,
  source: "body" | "query" | "params" = "body"
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data =
        source === "body"
          ? req.body
          : source === "query"
          ? req.query
          : req.params;
      const validated = schema.parse(data);

      // Replace the original data with validated data
      if (source === "body") {
        req.body = validated;
      } else if (source === "query") {
        Object.assign(req.query, validated);
      } else {
        Object.assign(req.params, validated);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          `Validation error: ${message}`
        );
      }
      next(error);
    }
  };
}
