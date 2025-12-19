"use client";
import { useState, useEffect, useRef } from "react";
import { useTickers } from "@/hooks/useTickers";
import StockChart from "./StockChart";

interface TickerData {
  symbol: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  ts: number;
  change?: number;
  changePercent?: number;
}

interface DashboardProps {
  selectedSymbol?: string | null;
}

export default function Dashboard({
  selectedSymbol: propSelectedSymbol,
}: DashboardProps) {
  const tickers = useTickers(50);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(
    propSelectedSymbol || null
  );
  const [chartType, setChartType] = useState<"candlestick" | "line" | "ohlc">(
    "line"
  );
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M">("1D");
  const previousPrices = useRef<Record<string, number>>({});

  // Sync with prop
  useEffect(() => {
    if (propSelectedSymbol) {
      setSelectedSymbol(propSelectedSymbol);
    }
  }, [propSelectedSymbol]);

  // Group tickers by symbol and keep the latest data with change calculation
  const latestTickers = tickers.reduce<Record<string, TickerData>>(
    (acc, ticker) => {
      if (!acc[ticker.symbol] || acc[ticker.symbol].ts < ticker.ts) {
        const prevPrice = previousPrices.current[ticker.symbol] || ticker.price;
        const change = ticker.price - prevPrice;
        const changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0;

        acc[ticker.symbol] = {
          ...ticker,
          change,
          changePercent,
        };
        previousPrices.current[ticker.symbol] = ticker.price;
      }
      return acc;
    },
    {}
  );

  const uniqueTickers = Object.values(latestTickers);

  // Auto-select first ticker if none selected
  useEffect(() => {
    if (!selectedSymbol && uniqueTickers.length > 0) {
      setSelectedSymbol(uniqueTickers[0].symbol);
    }
  }, [selectedSymbol, uniqueTickers]);

  // Prepare chart data - ensure time is a number (Unix timestamp in seconds)
  const chartData = tickers
    .filter((t) => t.symbol === selectedSymbol && t.ts)
    .map((ticker) => {
      // Convert milliseconds to seconds for Unix timestamp
      const timeInSeconds = Math.floor(ticker.ts / 1000);
      return {
        time: timeInSeconds, // Number, not string
        open: ticker.open || ticker.price,
        high: ticker.high || ticker.price,
        low: ticker.low || ticker.price,
        close: ticker.price,
        value: ticker.price,
      };
    })
    .sort((a, b) => a.time - b.time);

  const selectedTicker = selectedSymbol ? latestTickers[selectedSymbol] : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Symbols"
          value={uniqueTickers.length.toString()}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
        />
        <StatCard
          label="Gainers"
          value={uniqueTickers
            .filter((t) => (t.changePercent || 0) > 0)
            .length.toString()}
          trend="up"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
        />
        <StatCard
          label="Losers"
          value={uniqueTickers
            .filter((t) => (t.changePercent || 0) < 0)
            .length.toString()}
          trend="down"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
          }
        />
        <StatCard
          label="Updates"
          value={tickers.length.toString()}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock List */}
        <div className="lg:col-span-1 card p-4">
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
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                />
              </svg>
              Market Overview
            </h2>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-profit pulse-live" />
              <span className="text-xs text-foreground-muted">Live</span>
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {uniqueTickers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-foreground-subtle animate-pulse"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-foreground-muted">
                  Connecting to market...
                </p>
                <p className="text-xs text-foreground-subtle mt-1">
                  Waiting for live data
                </p>
              </div>
            ) : (
              uniqueTickers.map((ticker, idx) => (
                <StockRow
                  key={ticker.symbol}
                  ticker={ticker}
                  isSelected={selectedSymbol === ticker.symbol}
                  onClick={() => setSelectedSymbol(ticker.symbol)}
                  index={idx}
                />
              ))
            )}
          </div>
        </div>

        {/* Chart Panel */}
        <div className="lg:col-span-2 card p-4">
          {/* Chart Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              {selectedTicker ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {selectedTicker.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {selectedTicker.symbol}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-mono font-bold tabular-nums">
                        ${selectedTicker.price.toFixed(2)}
                      </span>
                      <span
                        className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                          (selectedTicker.changePercent || 0) >= 0
                            ? "text-profit bg-profit-bg"
                            : "text-loss bg-loss-bg"
                        }`}
                      >
                        {(selectedTicker.changePercent || 0) >= 0 ? "+" : ""}
                        {(selectedTicker.changePercent || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <h2 className="text-lg font-semibold text-foreground">
                  Select a stock
                </h2>
              )}
            </div>

            {/* Chart Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Timeframe */}
              <div className="flex bg-secondary rounded-lg p-1">
                {(["1D", "1W", "1M", "3M"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      timeframe === tf
                        ? "bg-surface text-foreground shadow-sm"
                        : "text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Chart Type */}
              <div className="flex bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setChartType("line")}
                  className={`p-1.5 rounded-md transition-all ${
                    chartType === "line"
                      ? "bg-surface shadow-sm"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                  title="Line Chart"
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
                      d="M7 12l3-3 3 3 4-4"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setChartType("candlestick")}
                  className={`p-1.5 rounded-md transition-all ${
                    chartType === "candlestick"
                      ? "bg-surface shadow-sm"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                  title="Candlestick Chart"
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
                      d="M9 19V5M5 8h8M5 16h8M15 19V5m4 3h-8m8 8h-8"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setChartType("ohlc")}
                  className={`p-1.5 rounded-md transition-all ${
                    chartType === "ohlc"
                      ? "bg-surface shadow-sm"
                      : "text-foreground-muted hover:text-foreground"
                  }`}
                  title="OHLC Chart"
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
                      d="M8 7v10M16 7v10M8 12h8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Chart */}
          {selectedSymbol && chartData.length > 0 ? (
            <div className="relative">
              <StockChart
                data={chartData}
                chartType={chartType}
                symbol={selectedSymbol}
              />
              {/* OHLC Info */}
              {selectedTicker && selectedTicker.open && (
                <div className="absolute top-2 right-2 bg-surface/90 backdrop-blur-sm rounded-lg p-2 text-xs border border-border">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-foreground-muted">Open</span>
                    <span className="font-mono tabular-nums">
                      ${selectedTicker.open?.toFixed(2)}
                    </span>
                    <span className="text-foreground-muted">High</span>
                    <span className="font-mono tabular-nums text-profit">
                      ${selectedTicker.high?.toFixed(2)}
                    </span>
                    <span className="text-foreground-muted">Low</span>
                    <span className="font-mono tabular-nums text-loss">
                      ${selectedTicker.low?.toFixed(2)}
                    </span>
                    <span className="text-foreground-muted">Vol</span>
                    <span className="font-mono tabular-nums">
                      {selectedTicker.volume?.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 bg-secondary/50 rounded-xl border-2 border-dashed border-border">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto text-foreground-subtle opacity-50 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  />
                </svg>
                <p className="text-foreground-muted font-medium">
                  {selectedSymbol
                    ? "Loading chart data..."
                    : "Select a stock to view chart"}
                </p>
                <p className="text-xs text-foreground-subtle mt-1">
                  Real-time data will appear here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  trend,
  icon,
}: {
  label: string;
  value: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
}) {
  return (
    <div className="card p-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <div
          className={`p-2 rounded-lg ${
            trend === "up"
              ? "bg-profit-bg text-profit"
              : trend === "down"
              ? "bg-loss-bg text-loss"
              : "bg-secondary text-foreground-muted"
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tabular-nums text-foreground">
          {value}
        </p>
        <p className="text-xs text-foreground-muted mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// Stock Row Component
function StockRow({
  ticker,
  isSelected,
  onClick,
  index,
}: {
  ticker: TickerData;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}) {
  const isPositive = (ticker.changePercent || 0) >= 0;

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 animate-slide-up ${
        isSelected
          ? "bg-primary/10 border-2 border-primary/30"
          : "bg-secondary/50 border-2 border-transparent hover:bg-secondary hover:border-border"
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
              isPositive ? "bg-profit-bg text-profit" : "bg-loss-bg text-loss"
            }`}
          >
            {ticker.symbol.slice(0, 2)}
          </div>
          <div>
            <span className="font-semibold text-foreground text-sm">
              {ticker.symbol}
            </span>
            {ticker.volume && (
              <p className="text-xs text-foreground-subtle">
                Vol: {(ticker.volume / 1000000).toFixed(1)}M
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="font-mono font-bold tabular-nums text-foreground">
            ${ticker.price.toFixed(2)}
          </span>
          <p
            className={`text-xs font-medium ${
              isPositive ? "text-profit" : "text-loss"
            }`}
          >
            {isPositive ? "▲" : "▼"}{" "}
            {Math.abs(ticker.changePercent || 0).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}
