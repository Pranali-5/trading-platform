import { Server as HTTPServer } from 'http';
import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { alphaVantageClient } from './services/alphavantage';

let wss: WSServer | null = null;
let marketInterval: NodeJS.Timeout | null = null;

// List of stock symbols to track
const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
// Indian market symbols can be included as well
const INDIAN_SYMBOLS = ['RELIANCE.BSE', 'TCS.BSE', 'INFY.BSE'];

// Combine all symbols
const ALL_SYMBOLS = [...STOCK_SYMBOLS, ...INDIAN_SYMBOLS];

export function initWebSocket(server: HTTPServer, path = '/ws') {
  wss = new WSServer({ server, path });
  wss.on('connection', (socket: WebSocket) => {
    socket.send(JSON.stringify({ type: 'welcome', ts: Date.now() }));
  });

  // Start real market data stream if not running
  if (!marketInterval) {
    // Fetch initial data for all symbols
    fetchAndBroadcastStockData();
    
    // Set interval to fetch data periodically (every 60 seconds to respect API limits)
    marketInterval = setInterval(fetchAndBroadcastStockData, 60000);
  }
}

/**
 * Fetch stock data from Alpha Vantage and broadcast to all clients
 */
async function fetchAndBroadcastStockData() {
  try {
    // For free tier, we'll fetch one symbol at a time with a delay
    for (const symbol of ALL_SYMBOLS) {
      const stockData = await alphaVantageClient.getQuote(symbol);
      
      if (stockData) {
        broadcast({ 
          type: 'ticker', 
          payload: { 
            symbol: stockData.symbol, 
            price: stockData.price,
            open: stockData.open,
            high: stockData.high,
            low: stockData.low,
            volume: stockData.volume, 
            ts: stockData.timestamp 
          } 
        });
      }
      
      // Add delay between requests to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  } catch (error) {
    console.error('Error fetching stock data:', error);
    
    // Fallback to mock data if API fails
    const symbol = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)];
    const price = 50 + Math.random() * 500;
    broadcast({ type: 'ticker', payload: { symbol, price, ts: Date.now() } });
  }
}

export function broadcast(message: unknown) {
  if (!wss) return;
  const data = typeof message === 'string' ? message : JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}

export function shutdownWebSocket() {
  if (marketInterval) {
    clearInterval(marketInterval);
    marketInterval = null;
  }
  if (wss) {
    wss.close();
    wss = null;
  }
}


