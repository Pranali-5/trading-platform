import axios, { AxiosError } from "axios";
import { logger } from "../utils/logger.js";

interface StockData {
  symbol: string;
  price: number;
  timestamp: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

class AlphaVantageClient {
  private apiKey: string;
  private baseUrl: string = "https://www.alphavantage.co/query";
  private requestTimeout: number = 10000; // 10 seconds

  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || "";
    if (!this.apiKey) {
      logger.warn("ALPHA_VANTAGE_API_KEY not set in environment variables");
    }
  }

  /**
   * Get real-time quote for a symbol
   * @param symbol Stock symbol (e.g., 'IBM', 'AAPL')
   * @returns Promise with stock data
   */
  async getQuote(symbol: string): Promise<StockData | null> {
    if (!this.apiKey) {
      logger.debug("Alpha Vantage API key not configured", { symbol });
      return null;
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: "GLOBAL_QUOTE",
          symbol,
          apikey: this.apiKey,
        },
        timeout: this.requestTimeout,
      });

      const data = response.data;

      // Check for API rate limit message
      if (data["Note"] || data["Information"]) {
        const message = data["Note"] || data["Information"];
        logger.warn("Alpha Vantage API limit reached", { symbol, message });
        return null;
      }

      if (
        data["Global Quote"] &&
        Object.keys(data["Global Quote"]).length > 0
      ) {
        const quote = data["Global Quote"];
        const stockData = {
          symbol,
          price: parseFloat(quote["05. price"]),
          timestamp: Date.now(),
          open: parseFloat(quote["02. open"]),
          high: parseFloat(quote["03. high"]),
          low: parseFloat(quote["04. low"]),
          volume: parseFloat(quote["06. volume"]),
        };

        // Validate parsed data
        if (isNaN(stockData.price) || stockData.price <= 0) {
          logger.warn("Invalid price data from Alpha Vantage", {
            symbol,
            quote,
          });
          return null;
        }

        return stockData;
      }

      logger.warn("Invalid response format from Alpha Vantage", {
        symbol,
        data,
      });
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.code === "ECONNABORTED") {
          logger.warn("Alpha Vantage request timeout", { symbol });
        } else if (axiosError.response) {
          logger.warn("Alpha Vantage API error", {
            symbol,
            status: axiosError.response.status,
            statusText: axiosError.response.statusText,
          });
        } else {
          logger.warn("Alpha Vantage network error", {
            symbol,
            message: axiosError.message,
          });
        }
      } else {
        logger.warn("Error fetching quote from Alpha Vantage", {
          symbol,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      return null;
    }
  }

  /**
   * Get multiple stock quotes
   * @param symbols Array of stock symbols
   * @returns Promise with array of stock data
   */
  async getMultipleQuotes(symbols: string[]): Promise<StockData[]> {
    const results: StockData[] = [];

    // Alpha Vantage free tier has rate limits, so we need to process sequentially
    for (const symbol of symbols) {
      const quote = await this.getQuote(symbol);
      if (quote) {
        results.push(quote);
      }
      // Add a small delay to avoid hitting rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return results;
  }
}

// Export a singleton instance
export const alphaVantageClient = new AlphaVantageClient();
