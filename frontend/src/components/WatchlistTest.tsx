'use client';

import React, { useState, useEffect } from 'react';
import StockChart from './StockChart';

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

interface Watchlist {
  id: number;
  name: string;
  user_id: string;
  items: {
    id: number;
    symbol: string;
    watchlist_id: number;
  }[];
}

export default function WatchlistTest() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [selectedWatchlist, setSelectedWatchlist] = useState<number | null>(null);
  const [chartType, setChartType] = useState<'line' | 'candlestick' | 'ohlc'>('line');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock data for the chart
  const mockStockData = [
    { time: '2023-01-01', open: 150, high: 155, low: 145, close: 153 },
    { time: '2023-01-02', open: 153, high: 160, low: 150, close: 158 },
    { time: '2023-01-03', open: 158, high: 165, low: 155, close: 160 },
    { time: '2023-01-04', open: 160, high: 168, low: 158, close: 165 },
    { time: '2023-01-05', open: 165, high: 170, low: 160, close: 168 },
  ];

  // Fetch watchlists
  const fetchWatchlists = async () => {
    try {
      setLoading(true);
      // Use the mock watchlist endpoint
      const response = await fetch('http://localhost:4000/api/watchlists?userId=test-user');
      if (!response.ok) {
        throw new Error('Failed to fetch watchlists');
      }
      const data = await response.json();
      console.log('Watchlists data:', data);
      setWatchlists(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching watchlists:', err);
      setError('Failed to load watchlists. Using mock data instead.');
      // Use mock data if API fails
      setWatchlists([
        {
          id: 1,
          name: 'Mock Watchlist',
          user_id: 'test-user',
          items: [
            { id: 1, symbol: 'AAPL', watchlist_id: 1 },
            { id: 2, symbol: 'MSFT', watchlist_id: 1 },
            { id: 3, symbol: 'GOOGL', watchlist_id: 1 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Create a new watchlist
  const createWatchlist = async () => {
    if (!newWatchlistName.trim()) return;

    try {
      // Use the mock watchlist endpoint
      const response = await fetch('http://localhost:4000/api/watchlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWatchlistName, userId: 'test-user' })
      });
      console.log('Create watchlist response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to create watchlist');
      }

      const data = await response.json();
      setWatchlists([...watchlists, { ...data, items: [] }]);
      setNewWatchlistName('');
    } catch (err) {
      console.error('Error creating watchlist:', err);
      setError('Failed to create watchlist');

      // Mock creation if API fails
      const mockId = Date.now();
      setWatchlists([...watchlists, {
        id: mockId,
        name: newWatchlistName,
        user_id: 'test-user',
        items: []
      }]);
      setNewWatchlistName('');
    }
  };

  // Search for symbols
  const searchSymbols = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      // In a real app, this would call an API endpoint
      // For now, we'll simulate with mock data
      console.log(`Searching for symbol: ${query}`);

      // Mock search results based on query
      const mockSearchResults: SearchResult[] = [
        { symbol: 'AAPL', name: 'Apple Inc', type: 'Equity', region: 'United States', currency: 'USD' },
        { symbol: 'AMZN', name: 'Amazon.com Inc', type: 'Equity', region: 'United States', currency: 'USD' },
        { symbol: 'GOOGL', name: 'Alphabet Inc', type: 'Equity', region: 'United States', currency: 'USD' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', region: 'United States', currency: 'USD' },
        { symbol: 'TSLA', name: 'Tesla Inc', type: 'Equity', region: 'United States', currency: 'USD' },
        { symbol: 'META', name: 'Meta Platforms Inc', type: 'Equity', region: 'United States', currency: 'USD' },
        { symbol: 'NFLX', name: 'Netflix Inc', type: 'Equity', region: 'United States', currency: 'USD' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Equity', region: 'United States', currency: 'USD' },
      ].filter(result =>
        result.symbol.includes(query.toUpperCase()) ||
        result.name.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockSearchResults);
    } catch (error) {
      console.error('Error searching for symbols:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add a symbol to a watchlist
  const addSymbol = async (symbolToAdd: string = newSymbol) => {
    if (!selectedWatchlist || !symbolToAdd.trim()) return;

    try {
      const response = await fetch(`http://localhost:4000/api/watchlists/${selectedWatchlist}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: symbolToAdd })
      });

      if (!response.ok) {
        throw new Error('Failed to add symbol');
      }

      const data = await response.json();

      // Update the watchlists state
      setWatchlists(watchlists.map(watchlist => {
        if (watchlist.id === selectedWatchlist) {
          return {
            ...watchlist,
            items: [...watchlist.items, { id: data.id, symbol: symbolToAdd, watchlist_id: selectedWatchlist }]
          };
        }
        return watchlist;
      }));

      setNewSymbol('');
      setSearchResults([]);
    } catch (err) {
      console.error('Error adding symbol:', err);
      setError('Failed to add symbol');

      // Mock addition if API fails
      const mockItemId = Date.now();
      setWatchlists(watchlists.map(watchlist => {
        if (watchlist.id === selectedWatchlist) {
          return {
            ...watchlist,
            items: [...watchlist.items, { id: mockItemId, symbol: symbolToAdd, watchlist_id: selectedWatchlist }]
          };
        }
        return watchlist;
      }));
      setNewSymbol('');
      setSearchResults([]);
    }
  };

  // Remove a symbol from a watchlist
  const removeSymbol = async (watchlistId: number, symbol: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/watchlists/${watchlistId}/items/${symbol}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove symbol');
      }

      // Update the watchlists state
      setWatchlists(watchlists.map(watchlist => {
        if (watchlist.id === watchlistId) {
          return {
            ...watchlist,
            items: watchlist.items.filter(item => item.symbol !== symbol)
          };
        }
        return watchlist;
      }));
    } catch (err) {
      console.error('Error removing symbol:', err);
      setError('Failed to remove symbol');

      // Mock removal if API fails
      setWatchlists(watchlists.map(watchlist => {
        if (watchlist.id === watchlistId) {
          return {
            ...watchlist,
            items: watchlist.items.filter(item => item.symbol !== symbol)
          };
        }
        return watchlist;
      }));
    }
  };

  // Load watchlists on component mount
  useEffect(() => {
    fetchWatchlists();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Watchlist Test</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Create Watchlist</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
            placeholder="Watchlist name"
            className="p-2 border rounded"
          />
          <button
            onClick={createWatchlist}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading watchlists...</div>
      ) : (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Your Watchlists</h2>

          {watchlists.length === 0 ? (
            <div>No watchlists found. Create one above.</div>
          ) : (
            <div className="space-y-4">
              {watchlists.map(watchlist => (
                <div key={watchlist.id} className="border rounded p-4">
                  <h3 className="text-lg font-medium mb-2">{watchlist.name}</h3>

                  <div className="mb-4">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Add Symbol:</h4>
                      <div className="flex flex-col gap-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={selectedWatchlist === watchlist.id ? newSymbol : ''}
                            onChange={(e) => {
                              setSelectedWatchlist(watchlist.id);
                              setNewSymbol(e.target.value.toUpperCase());
                              searchSymbols(e.target.value);
                            }}
                            placeholder="Search for symbol (e.g., AAPL)"
                            className="p-2 pl-8 border rounded w-full"
                          />
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-2 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          {isSearching && (
                            <div className="absolute right-2 top-2.5">
                              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                        {searchResults.length > 0 && newSymbol.trim() && selectedWatchlist === watchlist.id && (
                          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                            {searchResults.map((result) => (
                              <div
                                key={result.symbol}
                                className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                onClick={() => {
                                  setNewSymbol(result.symbol);
                                  addSymbol(result.symbol);
                                }}
                              >
                                <div>
                                  <div className="font-medium">{result.symbol}</div>
                                  <div className="text-sm text-gray-600">{result.name}</div>
                                </div>
                                <div className="text-xs text-gray-500">{result.region}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedWatchlist(watchlist.id);
                              addSymbol();
                            }}
                            disabled={!newSymbol.trim()}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            Add Symbol
                          </button>
                          {/* Quick add buttons for popular symbols */}
                          <div className="flex gap-1 overflow-x-auto">
                            {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'].map(symbol => (
                              <button
                                key={symbol}
                                onClick={() => {
                                  setSelectedWatchlist(watchlist.id);
                                  setNewSymbol(symbol);
                                }}
                                className="px-2 py-1 border rounded text-xs hover:bg-gray-100"
                              >
                                {symbol}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {watchlist.items?.length === 0 ? (
                      <div>No symbols in this watchlist.</div>
                    ) : (
                      <div>
                        <h4 className="font-medium mb-2">Symbols:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 w-full">
                          {watchlist.items?.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-2 border rounded bg-gray-50 hover:bg-gray-100 w-96">
                              <div className="flex items-center w-44">
                                <span className="font-medium text-blue-600">{item.symbol}</span>
                              </div>
                              <button
                                onClick={() => removeSymbol(watchlist.id, item.symbol)}
                                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm ml-2"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {watchlist.items?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Chart Preview:</h4>
                      <div className="mb-2">
                        <label className="mr-2">Chart Type:</label>
                        <select
                          value={chartType}
                          onChange={(e) => setChartType(e.target.value as 'line' | 'candlestick' | 'ohlc')}
                          className="p-2 border rounded"
                        >
                          <option value="line">Line</option>
                          <option value="candlestick">Candlestick</option>
                          <option value="ohlc">OHLC</option>
                        </select>
                      </div>
                      <div className="border rounded p-2">
                        <StockChart
                          data={mockStockData}
                          width={600}
                          height={300}
                          symbol={watchlist.items[0].symbol}
                          chartType={chartType}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}