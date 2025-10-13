'use client';
import { useState, useEffect } from 'react';
import { useTickers } from '@/hooks/useTickers';
import { BASE_URL } from 'src/utils/constants';

interface WatchlistProps {
  userId: string;
  onSelectSymbol: (symbol: string) => void;
}

interface Watchlist {
  id: number;
  name: string;
  user_id: string;
}

interface WatchlistItem {
  id: number;
  watchlist_id: number;
  symbol: string;
}

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

interface WatchlistWithItems extends Watchlist {
  items: WatchlistItem[];
}

export default function Watchlist({ userId, onSelectSymbol }: WatchlistProps) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<number | null>(null);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingSymbol, setIsAddingSymbol] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const tickers = useTickers();

  // Group tickers by symbol and keep the latest data
  const latestTickers = tickers.reduce<Record<string, any>>((acc, ticker) => {
    if (!acc[ticker.symbol] || acc[ticker.symbol].ts < ticker.ts) {
      acc[ticker.symbol] = ticker;
    }
    return acc;
  }, {});

  // Fetch user's watchlists
  useEffect(() => {
    if (!userId) return;

    fetch(`${BASE_URL}/api/watchlists?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setWatchlists(data);
        if (data.length > 0 && !selectedWatchlist) {
          setSelectedWatchlist(data[0].id);
        }
      })
      .catch(err => console.error('Error fetching watchlists:', err));
  }, [userId, selectedWatchlist]);

  // Fetch watchlist items when a watchlist is selected
  useEffect(() => {
    if (!selectedWatchlist) return;

    fetch(`${BASE_URL}/api/watchlists/${selectedWatchlist}`)
      .then(res => res.json())
      .then((data: WatchlistWithItems) => {
        console.log('data111:', data)
        // Ensure items is always an array
        setWatchlistItems(data.items || []);
      })
      .catch(err => {
        console.error('Error fetching watchlist items:', err);
        setWatchlistItems([]);
      });
  }, [selectedWatchlist]);

  // Create a new watchlist
  const createWatchlist = () => {
    if (!newWatchlistName.trim()) return;

    fetch(`${BASE_URL}/api/watchlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newWatchlistName, userId })
    })
      .then(res => res.json())
      .then(data => {
        setWatchlists([...watchlists, data]);
        setSelectedWatchlist(data.id);
        setNewWatchlistName('');
        setIsCreating(false);
      })
      .catch(err => console.error('Error creating watchlist:', err));
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

  // Add a symbol to the selected watchlist
  const addSymbolToWatchlist = (symbolToAdd: string = newSymbol) => {
    if (!symbolToAdd.trim() || !selectedWatchlist) return;

    const normalizedSymbol = symbolToAdd.toUpperCase();
    // Prevent adding duplicates
    if (Array.isArray(watchlistItems) && watchlistItems.some(item => item.symbol === normalizedSymbol)) {
      setNewSymbol('');
      setIsAddingSymbol(false);
      setSearchResults([]);
      return;
    }

    fetch(`${BASE_URL}/api/watchlists/${selectedWatchlist}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: normalizedSymbol })
    })
      .then(res => res.json())
      .then(data => {
        // Ensure watchlistItems is always treated as an array
        const currentItems = Array.isArray(watchlistItems) ? watchlistItems : [];
        console.log('here:', [...currentItems, data])
        setWatchlistItems([...currentItems, data]);
        setNewSymbol('');
        setIsAddingSymbol(false);
        setSearchResults([]);
      })
      .catch(err => {
        console.error('Error adding symbol to watchlist:', err);
        alert('Error adding symbol to watchlist: ' + err.message);
      });
  };

  // Remove a symbol from the watchlist
  const removeSymbol = (symbol: string) => {
    if (!selectedWatchlist) return;

    fetch(`${BASE_URL}/api/watchlists/${selectedWatchlist}/items/${symbol}`, {
      method: 'DELETE'
    })
      .then(() => {
        // Ensure watchlistItems is always treated as an array
        const currentItems = Array.isArray(watchlistItems) ? watchlistItems : [];
        setWatchlistItems(currentItems.filter(item => item.symbol !== symbol));
      })
      .catch(err => {
        console.error('Error removing symbol from watchlist:', err);
        alert('Error removing symbol from watchlist: ' + err.message);
      });
  };
  console.log('watchlistItems:', watchlistItems)
  return (
    <div className="watchlist bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 max-h-[calc(100vh-220px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          <span className="inline-block mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
          </span>
          Watchlists
        </h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="text-sm px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center"
        >
          {isCreating ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Watchlist
            </>
          )}
        </button>
      </div>

      {/* Create new watchlist form */}
      {isCreating && (
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="mb-3">
            <label htmlFor="watchlist-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Watchlist Name</label>
            <div className="relative">
              <input
                id="watchlist-name"
                type="text"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                placeholder="Enter a name for your watchlist"
                className="w-full p-2 pl-8 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-blue-400"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-2 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <button
            onClick={createWatchlist}
            disabled={!newWatchlistName.trim()}
            className="w-full p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Watchlist
          </button>
        </div>
      )}

      {/* Watchlist selector */}
      {watchlists.length > 0 && (
        <div className="mb-4">
          <label htmlFor="watchlist-selector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Watchlist</label>
          <div className="relative">
            <select
              id="watchlist-selector"
              value={selectedWatchlist || ''}
              onChange={(e) => setSelectedWatchlist(Number(e.target.value))}
              className="w-full p-2 pl-8 pr-8 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-blue-400"
            >
              {watchlists.map(list => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-2 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )}

      {/* Add symbol to watchlist */}
      {selectedWatchlist && (
        <div className="mb-4">
          {isAddingSymbol ? (
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="relative mb-2">
                <input
                  type="text"
                  value={newSymbol}
                  onChange={(e) => {
                    setNewSymbol(e.target.value.toUpperCase());
                    searchSymbols(e.target.value);
                  }}
                  placeholder="Search for symbol (e.g., AAPL)"
                  className="w-full p-2 pl-8 border rounded dark:bg-gray-800 dark:border-gray-600"
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

              {searchResults.length > 0 && newSymbol.trim() && (
                <div className="absolute z-10 mt-1 w-full max-w-md bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.symbol}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                      onClick={() => {
                        setNewSymbol(result.symbol);
                        addSymbolToWatchlist(result.symbol);
                      }}
                    >
                      <div>
                        <div className="font-medium">{result.symbol}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{result.name}</div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{result.region}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick add buttons for popular symbols */}
              <div className="mb-2 flex gap-1 overflow-x-auto">
                {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'].map(symbol => (
                  <button
                    key={symbol}
                    onClick={() => {
                      addSymbolToWatchlist(symbol);
                    }}
                    className="px-2 py-1 border rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600"
                  >
                    {symbol}
                  </button>
                ))}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => addSymbolToWatchlist()}
                  disabled={!newSymbol.trim()}
                  className="flex-1 p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingSymbol(false);
                    setSearchResults([]);
                    setNewSymbol('');
                  }}
                  className="flex-1 p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingSymbol(true)}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Symbol
            </button>
          )}
        </div>
      )}

      {/* Watchlist items */}
      {selectedWatchlist && (
        <div>
          <h4 className="font-medium mb-2">Symbols:</h4>
          {!Array.isArray(watchlistItems) || watchlistItems.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No symbols in this watchlist
            </p>
          ) : (
            <div className="grid gap-2 mb-4">
              {watchlistItems.map(item => {
                const ticker = latestTickers[item.symbol];
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-100 dark:bg-gray-700 rounded flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 w-full"
                    onClick={() => onSelectSymbol(item.symbol)}
                  >
                    <div className="flex items-center">
                      <span className="font-medium text-blue-600 dark:text-blue-400">{item.symbol}</span>
                      {ticker && (
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                          ${ticker.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSymbol(item.symbol);
                      }}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}