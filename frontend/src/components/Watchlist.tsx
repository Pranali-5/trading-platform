"use client";
import { useState, useEffect } from "react";
import { useTickers, Ticker } from "@/hooks/useTickers";
import { BASE_URL } from "src/utils/constants";

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

const POPULAR_SYMBOLS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "TSLA",
  "META",
  "NVDA",
];

const MOCK_SEARCH_RESULTS: SearchResult[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc",
    type: "Equity",
    region: "US",
    currency: "USD",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc",
    type: "Equity",
    region: "US",
    currency: "USD",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc",
    type: "Equity",
    region: "US",
    currency: "USD",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    type: "Equity",
    region: "US",
    currency: "USD",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc",
    type: "Equity",
    region: "US",
    currency: "USD",
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc",
    type: "Equity",
    region: "US",
    currency: "USD",
  },
  {
    symbol: "NFLX",
    name: "Netflix Inc",
    type: "Equity",
    region: "US",
    currency: "USD",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    type: "Equity",
    region: "US",
    currency: "USD",
  },
];

export default function Watchlist({ userId, onSelectSymbol }: WatchlistProps) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<number | null>(
    null
  );
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingSymbol, setIsAddingSymbol] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const tickers = useTickers();

  const latestTickers = tickers.reduce<Record<string, Ticker>>(
    (acc, ticker) => {
      if (!acc[ticker.symbol] || acc[ticker.symbol].ts < ticker.ts) {
        acc[ticker.symbol] = ticker;
      }
      return acc;
    },
    {}
  );

  // Fetch watchlists
  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    fetch(`${BASE_URL}/api/watchlists?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setWatchlists(data);
        if (data.length > 0 && !selectedWatchlist) {
          setSelectedWatchlist(data[0].id);
        }
      })
      .catch((err) => console.error("Error fetching watchlists:", err))
      .finally(() => setIsLoading(false));
  }, [userId, selectedWatchlist]);

  // Fetch watchlist items
  useEffect(() => {
    if (!selectedWatchlist) return;
    fetch(`${BASE_URL}/api/watchlists/${selectedWatchlist}`)
      .then((res) => res.json())
      .then((data: WatchlistWithItems) => {
        setWatchlistItems(data.items || []);
      })
      .catch((err) => {
        console.error("Error fetching watchlist items:", err);
        setWatchlistItems([]);
      });
  }, [selectedWatchlist]);

  const createWatchlist = () => {
    if (!newWatchlistName.trim()) return;
    fetch(`${BASE_URL}/api/watchlists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newWatchlistName, userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setWatchlists([...watchlists, data]);
        setSelectedWatchlist(data.id);
        setNewWatchlistName("");
        setIsCreating(false);
      })
      .catch((err) => console.error("Error creating watchlist:", err));
  };

  const searchSymbols = (query: string) => {
    if (!query.trim() || query.length < 1) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    setTimeout(() => {
      const results = MOCK_SEARCH_RESULTS.filter(
        (r) =>
          r.symbol.includes(query.toUpperCase()) ||
          r.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 200);
  };

  const addSymbolToWatchlist = (symbolToAdd: string = newSymbol) => {
    if (!symbolToAdd.trim() || !selectedWatchlist) return;
    const normalizedSymbol = symbolToAdd.toUpperCase();
    if (watchlistItems.some((item) => item.symbol === normalizedSymbol)) {
      setNewSymbol("");
      setIsAddingSymbol(false);
      setSearchResults([]);
      return;
    }

    fetch(`${BASE_URL}/api/watchlists/${selectedWatchlist}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: normalizedSymbol }),
    })
      .then((res) => res.json())
      .then((data) => {
        setWatchlistItems([...watchlistItems, data]);
        setNewSymbol("");
        setIsAddingSymbol(false);
        setSearchResults([]);
      })
      .catch((err) => console.error("Error adding symbol:", err));
  };

  const removeSymbol = (symbol: string) => {
    if (!selectedWatchlist) return;
    fetch(`${BASE_URL}/api/watchlists/${selectedWatchlist}/items/${symbol}`, {
      method: "DELETE",
    })
      .then(() => {
        setWatchlistItems(
          watchlistItems.filter((item) => item.symbol !== symbol)
        );
      })
      .catch((err) => console.error("Error removing symbol:", err));
  };

  return (
    <div className="card p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          Watchlist
        </h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className={`p-1.5 rounded-lg transition-all ${
            isCreating
              ? "bg-loss/10 text-loss"
              : "bg-secondary hover:bg-secondary-hover text-foreground-muted"
          }`}
        >
          {isCreating ? (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Create Watchlist Form */}
      {isCreating && (
        <div className="mb-4 p-3 bg-secondary rounded-xl border border-border animate-scale-in">
          <input
            type="text"
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
            placeholder="Watchlist name..."
            className="input mb-2 text-sm"
            autoFocus
          />
          <button
            onClick={createWatchlist}
            disabled={!newWatchlistName.trim()}
            className="w-full btn-primary text-sm py-2 disabled:opacity-50"
          >
            Create Watchlist
          </button>
        </div>
      )}

      {/* Watchlist Selector */}
      {watchlists.length > 0 && (
        <div className="mb-4">
          <select
            value={selectedWatchlist || ""}
            onChange={(e) => setSelectedWatchlist(Number(e.target.value))}
            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {watchlists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Add Symbol */}
      {selectedWatchlist && (
        <div className="mb-4">
          {isAddingSymbol ? (
            <div className="space-y-2 animate-scale-in">
              <div className="relative">
                <input
                  type="text"
                  value={newSymbol}
                  onChange={(e) => {
                    setNewSymbol(e.target.value.toUpperCase());
                    searchSymbols(e.target.value);
                  }}
                  placeholder="Search symbol..."
                  className="input text-sm pl-9"
                  autoFocus
                />
                <svg
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="animate-spin h-4 w-4 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && newSymbol && (
                <div className="bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.symbol}
                      onClick={() => addSymbolToWatchlist(result.symbol)}
                      className="w-full p-2 text-left hover:bg-secondary transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium text-sm text-foreground">
                          {result.symbol}
                        </span>
                        <span className="text-xs text-foreground-muted ml-2">
                          {result.name}
                        </span>
                      </div>
                      <svg
                        className="w-4 h-4 text-profit"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Add */}
              <div className="flex gap-1 flex-wrap">
                {POPULAR_SYMBOLS.filter(
                  (s) => !watchlistItems.some((i) => i.symbol === s)
                )
                  .slice(0, 5)
                  .map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => addSymbolToWatchlist(symbol)}
                      className="px-2 py-1 text-xs bg-secondary hover:bg-secondary-hover rounded-md transition-colors text-foreground-muted"
                    >
                      +{symbol}
                    </button>
                  ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => addSymbolToWatchlist()}
                  disabled={!newSymbol.trim()}
                  className="flex-1 btn-primary text-sm py-2 disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingSymbol(false);
                    setSearchResults([]);
                    setNewSymbol("");
                  }}
                  className="flex-1 btn-secondary text-sm py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingSymbol(true)}
              className="w-full btn-secondary text-sm py-2 flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Symbol
            </button>
          )}
        </div>
      )}

      {/* Watchlist Items */}
      {selectedWatchlist && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <svg
                className="animate-spin h-8 w-8 mx-auto text-primary"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          ) : watchlistItems.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 mx-auto text-foreground-subtle opacity-50 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <p className="text-sm text-foreground-muted">No symbols yet</p>
              <p className="text-xs text-foreground-subtle">
                Add stocks to track
              </p>
            </div>
          ) : (
            watchlistItems.map((item, idx) => {
              const ticker = latestTickers[item.symbol];
              const isPositive =
                ticker && ticker.price > (ticker.open || ticker.price);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectSymbol(item.symbol)}
                  className="group p-3 bg-secondary/50 hover:bg-secondary rounded-xl border border-transparent hover:border-border cursor-pointer transition-all animate-slide-up"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isPositive
                            ? "bg-profit-bg text-profit"
                            : "bg-loss-bg text-loss"
                        }`}
                      >
                        {item.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-foreground">
                          {item.symbol}
                        </span>
                        {ticker && (
                          <p className="text-xs text-foreground-muted font-mono tabular-nums">
                            ${ticker.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSymbol(item.symbol);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-loss/10 text-loss hover:bg-loss/20 transition-all"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
