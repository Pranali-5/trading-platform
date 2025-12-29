import mysql, { Pool } from "mysql2/promise";
import { logger } from "./utils/logger.js";
import { getEnv } from "./utils/env.js";

let poolInstance: Pool | null = null;

/**
 * Create and configure database connection pool with optimized settings
 */
export async function createPool(): Promise<Pool> {
  if (poolInstance) {
    return poolInstance;
  }

  const env = getEnv();

  // Only create pool if database configuration is provided
  if (!env.DB_HOST || !env.DB_USER || !env.DB_NAME) {
    logger.warn("Database configuration not provided, skipping pool creation");
    throw new Error("Database configuration is required");
  }

  try {
    const pool = mysql.createPool({
      host: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PASSWORD || "",
      database: env.DB_NAME,
      port: env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 20, // Increased for better concurrency
      queueLimit: 0,
      connectTimeout: 10000, // 10 seconds timeout
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    // Test the connection
    try {
      await pool.query("SELECT 1");
      logger.info("Database connection pool created successfully", {
        host: env.DB_HOST,
        database: env.DB_NAME,
        connectionLimit: 20,
      });
    } catch (error: unknown) {
      logger.error(
        "Database connection test failed",
        error instanceof Error ? error : new Error(String(error)),
        {
          host: env.DB_HOST,
          database: env.DB_NAME,
        }
      );
      throw error;
    }

    poolInstance = pool;
    return pool;
  } catch (error: unknown) {
    logger.error(
      "Failed to create database pool",
      error instanceof Error ? error : new Error(String(error)),
      {
        host: env.DB_HOST,
        database: env.DB_NAME,
      }
    );
    throw error;
  }
}

/**
 * Get existing pool instance or create new one
 */
export async function getPool(): Promise<Pool> {
  if (!poolInstance) {
    return createPool();
  }
  return poolInstance;
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const pool = await getPool();
    await pool.query("SELECT 1");
    return true;
  } catch (error) {
    logger.warn("Database health check failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Gracefully close database pool
 */
export async function closePool(): Promise<void> {
  if (poolInstance) {
    logger.info("Closing database connection pool...");
    await poolInstance.end();
    poolInstance = null;
    logger.info("Database connection pool closed");
  }
}
