'use client';
import { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickSeries, LineSeries, BarSeries } from 'lightweight-charts';

interface StockChartProps {
  data: any[];
  chartType: 'candlestick' | 'line' | 'ohlc';
  width?: number;
  height?: number;
  symbol?: string;
  theme?: 'light' | 'dark';
}

export default function StockChart({
  data,
  chartType = 'candlestick',
  width = 600,
  height = 300,
  symbol = '',
  theme = 'light'
}: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<any | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clear previous chart if it exists
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    // Set chart colors based on theme
    const isDark = theme === 'dark';
    const backgroundColor = isDark ? '#1e1e1e' : '#ffffff';
    const textColor = isDark ? '#d1d4dc' : '#131722';
    const gridColor = isDark ? '#2e2e2e' : '#f0f3fa';

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        background: { color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      timeScale: {
        borderColor: gridColor,
      },
      rightPriceScale: {
        borderColor: gridColor,
      },
    });

    // Add series based on chart type
    let series;
    if (chartType === 'candlestick') {
      series = chart.addSeries(CandlestickSeries, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
      series.setData(data);
    } else if (chartType === 'line') {
      series = chart.addSeries(LineSeries, {
        color: '#2962FF',
        lineWidth: 2,
      });
      // Transform OHLC data to line data format (time and value)
      const lineData = data.map(item => ({
        time: item.time,
        value: item.close
      }));
      series.setData(lineData);
    } else if (chartType === 'ohlc') {
      // Use BarSeries for OHLC chart type
      series = chart.addSeries(BarSeries, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        thinBars: true,
        openVisible: true,
      });
      series.setData(data);
    } else {
      // Default to candlestick if unknown chart type
      series = chart.addSeries(CandlestickSeries, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
      series.setData(data);
    }

    // Store references
    chartRef.current = chart;
    seriesRef.current = series || null;

    // Fit content
    chart.timeScale().fitContent();

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [data, chartType, width, height, theme]);

  return (
    <div className="stock-chart-container">
      {symbol && (
        <div className="text-sm font-medium mb-2">{symbol}</div>
      )}
      <div ref={chartContainerRef} />
    </div>
  );
}