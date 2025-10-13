'use client';
import { useState, useEffect } from 'react';
import { useTickers } from '@/hooks/useTickers';
import StockChart from './StockChart';
import { LineData, UTCTimestamp } from 'lightweight-charts';

interface TickerData {
  symbol: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  ts: number;
}

export default function Dashboard() {
  const tickers = useTickers(10);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [chartData, setChartData] = useState<LineData<UTCTimestamp>[]>([]);
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'ohlc'>('line');

  // Group tickers by symbol and keep the latest data
  const latestTickers = tickers.reduce<Record<string, TickerData>>((acc, ticker) => {
    if (!acc[ticker.symbol] || acc[ticker.symbol].ts < ticker.ts) {
      acc[ticker.symbol] = ticker;
    }
    return acc;
  }, {});

  // Convert to array for rendering
  const uniqueTickers = Object.values(latestTickers);

  // Update chart data when new tickers arrive
  useEffect(() => {
    if (!selectedSymbol) {
      // If no symbol is selected and we have tickers, select the first one
      if (uniqueTickers.length > 0) {
        setSelectedSymbol(uniqueTickers[0].symbol);
      }
      return;
    }

    // Find tickers for the selected symbol
    const symbolTickers = tickers.filter(t => t.symbol === selectedSymbol);

    if (symbolTickers.length > 0) {
      // Convert to chart data format
      const newChartData: LineData<UTCTimestamp>[] = symbolTickers.map(ticker => ({
        time: (ticker.ts / 1000) as UTCTimestamp,
        value: ticker.price,
      }));

      // Sort by time
      newChartData.sort((a, b) => a.time - b.time);
      setChartData(newChartData);
    }
  }, [tickers, selectedSymbol]);

  return (
    <div className="dashboard">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Stock List Panel */}
        <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 max-h-[calc(100vh-220px)] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Market Overview</h2>
          <div className="space-y-2">
            {uniqueTickers.slice(0, 5).map((ticker) => (
              <div
                key={ticker.symbol}
                className={`p-3 rounded-md cursor-pointer transition-colors ${selectedSymbol === ticker.symbol ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => setSelectedSymbol(ticker.symbol)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{ticker.symbol}</span>
                  <span className="tabular-nums font-semibold">
                    ${ticker.price.toFixed(2)}
                  </span>
                </div>
                {ticker.open !== undefined && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
                    <span>O: {ticker.open.toFixed(2)}</span>
                    <span>H: {ticker.high?.toFixed(2)}</span>
                    <span>L: {ticker.low?.toFixed(2)}</span>
                    <span>V: {ticker.volume?.toLocaleString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chart Panel */}
        <div className="w-full md:w-2/3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {selectedSymbol ? `${selectedSymbol} Chart` : 'Select a stock'}
            </h2>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded ${chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                onClick={() => setChartType('line')}
              >
                Line
              </button>
              <button
                className={`px-3 py-1 text-sm rounded ${chartType === 'candlestick' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                onClick={() => setChartType('candlestick')}
              >
                Candlestick
              </button>
              <button
                className={`px-3 py-1 text-sm rounded ${chartType === 'ohlc' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                onClick={() => setChartType('ohlc')}
              >
                OHLC
              </button>
            </div>
          </div>

          {selectedSymbol && chartData.length > 0 ? (
            <div className="chart-container">
              <StockChart
                data={chartData}
                chartType={chartType}
                symbol={selectedSymbol}
                width={600}
                height={400}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="text-gray-500 dark:text-gray-400">
                {selectedSymbol ? 'Waiting for data...' : 'Select a stock to view chart'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}