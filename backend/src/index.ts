import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { initWebSocket } from "./ws.js";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import watchlistsRouter from "./routes/watchlists.js";
import mockWatchlistRouter from "./routes/watchlist-routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Basic REST route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
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
app.use(
  "/api/notifications",
  (await import("./routes/notifications.js")).default
);
// Comment out the real watchlist router since we're using the mock one
// app.use('/api/watchlists', watchlistsRouter);
// Use the mock watchlist router for all watchlist operations
app.use("/api", mockWatchlistRouter);

const server = createServer(app);
initWebSocket(server, "/ws");

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});
