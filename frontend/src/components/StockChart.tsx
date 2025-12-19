'use client';
import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, CandlestickSeries, LineSeries, BarSeries, ColorType } from 'lightweight-charts';

interface ChartDataPoint {
  time: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  value?: number;
}

interface StockChartProps {
  data: ChartDataPoint[];
  chartType: 'candlestick' | 'line' | 'ohlc';
  symbol?: string;
}

export default function StockChart({
  data,
  chartType = 'line',
  symbol = '',
}: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Theme colors
    const colors = {
      background: isDark ? '#0f1419' : '#ffffff',
      text: isDark ? '#8899a6' : '#536471',
      grid: isDark ? '#1e2732' : '#f0f3f5',
      border: isDark ? '#2f3336' : '#ebeef0',
      upColor: '#26a69a',
      downColor: '#ef5350',
      lineColor: isDark ? '#3b82f6' : '#2962ff',
    };

    // Get container dimensions
    const containerWidth = chartContainerRef.current.clientWidth;
    const containerHeight = 400;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: containerWidth,
      height: containerHeight,
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.text,
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      },
      grid: {
        vertLines: { color: colors.grid, style: 1 },
        horzLines: { color: colors.grid, style: 1 },
      },
      timeScale: {
        borderColor: colors.border,
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 12,
      },
      rightPriceScale: {
        borderColor: colors.border,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: isDark ? '#3b82f6' : '#2962ff',
          width: 1,
          style: 2,
          labelBackgroundColor: isDark ? '#3b82f6' : '#2962ff',
        },
        horzLine: {
          color: isDark ? '#3b82f6' : '#2962ff',
          width: 1,
          style: 2,
          labelBackgroundColor: isDark ? '#3b82f6' : '#2962ff',
        },
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });

    // Add series based on chart type
    if (chartType === 'candlestick') {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: colors.upColor,
        downColor: colors.downColor,
        borderVisible: false,
        wickUpColor: colors.upColor,
        wickDownColor: colors.downColor,
      });

      const candleData = data.map(item => ({
        time: item.time,
        open: item.open || item.value || 0,
        high: item.high || item.value || 0,
        low: item.low || item.value || 0,
        close: item.close || item.value || 0,
      }));
      series.setData(candleData as any);
    } else if (chartType === 'line') {
      const series = chart.addSeries(LineSeries, {
        color: colors.lineColor,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: colors.lineColor,
        crosshairMarkerBackgroundColor: colors.background,
        lastValueVisible: true,
        priceLineVisible: true,
        priceLineWidth: 1,
        priceLineStyle: 2,
      });

      const lineData = data.map(item => ({
        time: item.time,
        value: item.close || item.value || 0,
      }));
      series.setData(lineData as any);

      // Add area gradient effect
      series.applyOptions({
        lineType: 0,
      });
    } else if (chartType === 'ohlc') {
      const series = chart.addSeries(BarSeries, {
        upColor: colors.upColor,
        downColor: colors.downColor,
        thinBars: false,
        openVisible: true,
      });

      const ohlcData = data.map(item => ({
        time: item.time,
        open: item.open || item.value || 0,
        high: item.high || item.value || 0,
        low: item.low || item.value || 0,
        close: item.close || item.value || 0,
      }));
      series.setData(ohlcData as any);
    }

    chartRef.current = chart;
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, chartType, isDark]);

  return (
    <div className="relative">
      {symbol && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-surface/80 backdrop-blur-sm rounded-md border border-border">
          <span className="text-xs font-medium text-foreground-muted">{symbol}</span>
        </div>
      )}
      <div
        ref={chartContainerRef}
        className="w-full rounded-xl overflow-hidden border border-border"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}
