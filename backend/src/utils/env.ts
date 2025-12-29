import { z } from "zod";
import { logger } from "./logger.js";

/**
 * Environment variable schema
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().regex(/^\d+$/).transform(Number).default("4000"),
  ALPHA_VANTAGE_API_KEY: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().optional(),
  KAFKA_BROKER: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Validate and return environment variables
 */
export function getEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    logger.info("Environment variables validated successfully");
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      logger.error("Environment validation failed", undefined, { issues });
      throw new Error(`Invalid environment variables: ${issues}`);
    }
    throw error;
  }
}
