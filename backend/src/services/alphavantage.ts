import axios from 'axios';

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
  private baseUrl: string = 'https://www.alphavantage.co/query';

  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('ALPHA_VANTAGE_API_KEY not set in environment variables');
    }
  }

  /**
   * Get real-time quote for a symbol
   * @param symbol Stock symbol (e.g., 'IBM', 'AAPL')
   * @returns Promise with stock data
   */
  async getQuote(symbol: string): Promise<StockData | null> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: this.apiKey
        }
      });

      const data = response.data;
      
      if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
        const quote = data['Global Quote'];
        return {
          symbol,
          price: parseFloat(quote['05. price']),
          timestamp: Date.now(),
          open: parseFloat(quote['02. open']),
          high: parseFloat(quote['03. high']),
          low: parseFloat(quote['04. low']),
          volume: parseFloat(quote['06. volume'])
        };
      }
      
      console.error('Invalid response format from Alpha Vantage:', data);
      return null;
    } catch (error) {
      console.error('Error fetching quote from Alpha Vantage:', error);
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
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return results;
  }
}

// Export a singleton instance
export const alphaVantageClient = new AlphaVantageClient();