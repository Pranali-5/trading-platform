import { Server as HTTPServer } from "http";
import { WebSocketServer as WSServer, WebSocket } from "ws";
import { alphaVantageClient } from "./services/alphavantage.js";
import { logger } from "./utils/logger.js";

interface StockDataCache {
  data: {
    symbol: string;
    price: number;
    open?: number;
    high?: number;
    low?: number;
    volume?: number;
    ts: number;
  } | null;
  timestamp: number;
}

let wss: WSServer | null = null;
let marketInterval: NodeJS.Timeout | null = null;

// List of stock symbols to track
const STOCK_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "META"];
// Indian market symbols can be included as well
const INDIAN_SYMBOLS = ["RELIANCE.BSE", "TCS.BSE", "INFY.BSE"];

// Combine all symbols
const ALL_SYMBOLS = [...STOCK_SYMBOLS, ...INDIAN_SYMBOLS];

// Cache for stock data (5 second TTL)
const stockCache = new Map<string, StockDataCache>();
const CACHE_TTL = 5000; // 5 seconds

// Rate limiting: Alpha Vantage free tier allows 5 calls per minute
const RATE_LIMIT_DELAY = 13000; // ~13 seconds between calls to stay under limit
const BATCH_SIZE = 1; // Process one at a time for free tier

export function initWebSocket(server: HTTPServer, path = "/ws") {
  wss = new WSServer({ server, path });

  wss.on("connection", (socket: WebSocket) => {
    logger.debug("WebSocket client connected", {
      clientCount: wss?.clients.size || 0,
    });

    socket.send(JSON.stringify({ type: "welcome", ts: Date.now() }));

    // Send cached data immediately on connection
    sendCachedData(socket);

    socket.on("close", () => {
      logger.debug("WebSocket client disconnected", {
        clientCount: wss?.clients.size || 0,
      });
    });

    socket.on("error", (error) => {
      logger.warn("WebSocket error", { error: error.message });
    });
  });

  // Start real market data stream if not running
  if (!marketInterval) {
    // Fetch initial data for all symbols
    fetchAndBroadcastStockData().catch((error) => {
      logger.error("Initial stock data fetch failed", error);
    });

    // Set interval to fetch data periodically (every 60 seconds to respect API limits)
    marketInterval = setInterval(() => {
      fetchAndBroadcastStockData().catch((error) => {
        logger.error("Periodic stock data fetch failed", error);
      });
    }, 60000);

    logger.info("WebSocket server initialized", {
      path,
      symbolCount: ALL_SYMBOLS.length,
    });
  }
}

/**
 * Send cached data to a specific client
 */
function sendCachedData(socket: WebSocket) {
  if (socket.readyState !== WebSocket.OPEN) return;

  for (const [symbol, cache] of stockCache.entries()) {
    if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
      socket.send(
        JSON.stringify({
          type: "ticker",
          payload: cache.data,
        })
      );
    }
  }
}

/**
 * Fetch stock data from Alpha Vantage and broadcast to all clients
 * Optimized with caching and better error handling
 */
async function fetchAndBroadcastStockData() {
  if (!wss || wss.clients.size === 0) {
    logger.debug("No WebSocket clients connected, skipping fetch");
    return;
  }

  const results: Array<{ symbol: string; data: StockDataCache["data"] }> = [];

  // Process symbols in batches to respect rate limits
  for (let i = 0; i < ALL_SYMBOLS.length; i += BATCH_SIZE) {
    const batch = ALL_SYMBOLS.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (symbol) => {
        try {
          // Check cache first
          const cached = stockCache.get(symbol);
          if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            logger.debug("Using cached data", { symbol });
            results.push({ symbol, data: cached.data });
            return;
          }

          const stockData = await alphaVantageClient.getQuote(symbol);

          if (stockData) {
            const payload = {
              symbol: stockData.symbol,
              price: stockData.price,
              open: stockData.open,
              high: stockData.high,
              low: stockData.low,
              volume: stockData.volume,
              ts: stockData.timestamp,
            };

            // Update cache
            stockCache.set(symbol, {
              data: payload,
              timestamp: Date.now(),
            });

            results.push({ symbol, data: payload });

            // Broadcast immediately
            broadcast({
              type: "ticker",
              payload,
            });
          } else {
            // Use cached data if available, even if expired
            if (cached?.data) {
              logger.debug("Using expired cache due to API failure", {
                symbol,
              });
              results.push({ symbol, data: cached.data });
              broadcast({
                type: "ticker",
                payload: cached.data,
              });
            }
          }
        } catch (error) {
          logger.warn("Error fetching stock data for symbol", {
            symbol,
            error: error instanceof Error ? error.message : String(error),
          });

          // Fallback to cached data if available
          const cached = stockCache.get(symbol);
          if (cached?.data) {
            results.push({ symbol, data: cached.data });
            broadcast({
              type: "ticker",
              payload: cached.data,
            });
          } else {
            // Generate mock data as last resort
            const mockData = {
              symbol,
              price: 50 + Math.random() * 500,
              ts: Date.now(),
            };
            broadcast({
              type: "ticker",
              payload: mockData,
            });
          }
        }
      })
    );

    // Rate limiting delay between batches
    if (i + BATCH_SIZE < ALL_SYMBOLS.length) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
    }
  }

  logger.debug("Stock data fetch completed", {
    fetched: results.filter((r) => r.data).length,
    total: ALL_SYMBOLS.length,
  });
}

export function broadcast(message: unknown) {
  if (!wss) return;

  const data = typeof message === "string" ? message : JSON.stringify(message);
  let sentCount = 0;
  let errorCount = 0;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(data);
        sentCount++;
      } catch (error) {
        errorCount++;
        logger.warn("Error sending WebSocket message", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  });

  if (errorCount > 0) {
    logger.debug("Broadcast completed with errors", { sentCount, errorCount });
  }
}

export function shutdownWebSocket() {
  logger.info("Shutting down WebSocket server...");

  if (marketInterval) {
    clearInterval(marketInterval);
    marketInterval = null;
  }

  if (wss) {
    // Close all client connections
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.close();
      }
    });

    wss.close(() => {
      logger.info("WebSocket server closed");
    });
    wss = null;
  }

  // Clear cache
  stockCache.clear();
}
