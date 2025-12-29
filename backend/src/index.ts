import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { initWebSocket, shutdownWebSocket } from "./ws.js";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import mockWatchlistRouter from "./routes/watchlist-routes.js";
import { errorHandler } from "./utils/errors.js";
import { getEnv } from "./utils/env.js";
import { logger } from "./utils/logger.js";

// Validate environment variables on startup
const env = getEnv();

const app = express();

// Security headers
app.use((_req: Request, res: Response, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// CORS configuration
const corsOptions = {
  origin:
    process.env.CORS_ORIGIN || (env.NODE_ENV === "production" ? false : true),
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check with more details
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Swagger setup
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "Trading API", version: "0.1.0" },
  },
  apis: ["./src/routes/*.ts"],
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use(
  "/api/notifications",
  (await import("./routes/notifications.js")).default
);
app.use("/api", mockWatchlistRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

const server = createServer(app);
initWebSocket(server, "/ws");

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  server.close(() => {
    logger.info("HTTP server closed");
  });

  shutdownWebSocket();

  // Give connections time to close
  setTimeout(() => {
    logger.info("Shutdown complete");
    process.exit(0);
  }, 5000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

const port = env.PORT;
server.listen(port, () => {
  logger.info(`API listening on http://localhost:${port}`, {
    port,
    env: env.NODE_ENV,
  });
});
