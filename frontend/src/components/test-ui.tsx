'use client';

import React, { useState } from 'react';
import StockChart from './StockChart';
import ThemeToggle from './ThemeToggle';

// Mock data for testing
const mockStockData = [
  { time: '2023-01-01', open: 150, high: 155, low: 145, close: 153 },
  { time: '2023-01-02', open: 153, high: 160, low: 150, close: 158 },
  { time: '2023-01-03', open: 158, high: 165, low: 155, close: 160 },
  { time: '2023-01-04', open: 160, high: 168, low: 158, close: 165 },
  { time: '2023-01-05', open: 165, high: 170, low: 160, close: 168 },
];

export default function TestUI() {
  const [chartType, setChartType] = useState<'line' | 'candlestick' | 'ohlc'>('line');
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">UI Component Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Theme Toggle Test</h2>
        <div className="p-4 border rounded">
          <ThemeToggle />
          <p className="mt-2">Try clicking the toggle to switch between dark and light mode</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Chart Component Test</h2>
        <div className="p-4 border rounded">
          <div className="mb-4">
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
              width={800} 
              height={400} 
              symbol="AAPL" 
              chartType={chartType}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <p>This is a test page to verify that the UI components are working correctly.</p>
        <p>The theme toggle should change between dark and light mode.</p>
        <p>The chart should display mock stock data in the selected chart type.</p>
      </div>
    </div>
  );
}