"use client";
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  CandlestickSeries,
  LineSeries,
  BarSeries,
  ColorType,
} from "lightweight-charts";

interface ChartDataPoint {
  time: number | string; // Unix timestamp (number) or date string
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  value?: number;
  price?: number; // Alias for value/close
}

interface StockChartProps {
  data: ChartDataPoint[];
  chartType: "candlestick" | "line" | "ohlc";
  symbol?: string;
}

export default function StockChart({
  data,
  chartType = "line",
  symbol = "",
}: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (!data || data.length === 0) return;

    try {
      // Clear previous chart
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }

      // Theme colors
      const colors = {
        background: isDark ? "#0f1419" : "#ffffff",
        text: isDark ? "#8899a6" : "#536471",
        grid: isDark ? "#1e2732" : "#f0f3f5",
        border: isDark ? "#2f3336" : "#ebeef0",
        upColor: "#26a69a",
        downColor: "#ef5350",
        lineColor: isDark ? "#3b82f6" : "#2962ff",
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
          fontFamily:
            "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
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
            color: isDark ? "#3b82f6" : "#2962ff",
            width: 1,
            style: 2,
            labelBackgroundColor: isDark ? "#3b82f6" : "#2962ff",
          },
          horzLine: {
            color: isDark ? "#3b82f6" : "#2962ff",
            width: 1,
            style: 2,
            labelBackgroundColor: isDark ? "#3b82f6" : "#2962ff",
          },
        },
        handleScroll: { mouseWheel: true, pressedMouseMove: true },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true,
        },
      });

      // Normalize time values - convert to number if string, handle invalid values
      const normalizeTime = (
        time: number | string | undefined | null
      ): number => {
        // Handle null/undefined
        if (time === null || time === undefined) {
          return Math.floor(Date.now() / 1000);
        }

        // If already a number, validate it's reasonable (not too large or negative)
        if (typeof time === "number") {
          // If timestamp is in milliseconds (13 digits), convert to seconds
          if (time > 1e12) {
            return Math.floor(time / 1000);
          }
          // If timestamp is reasonable (between 2000 and 2100), use as-is
          if (time > 946684800 && time < 4102444800) {
            return time;
          }
          // Otherwise, might be invalid, use current time
          return Math.floor(Date.now() / 1000);
        }

        // If string, try to parse as number first
        const numTime = Number(time);
        if (!isNaN(numTime) && isFinite(numTime)) {
          // Same validation as above
          if (numTime > 1e12) {
            return Math.floor(numTime / 1000);
          }
          if (numTime > 946684800 && numTime < 4102444800) {
            return numTime;
          }
        }

        // If it's a date string, convert to Unix timestamp
        try {
          const date = new Date(time);
          if (!isNaN(date.getTime())) {
            return Math.floor(date.getTime() / 1000);
          }
        } catch {
          // Invalid date string
        }

        // Fallback to current time
        return Math.floor(Date.now() / 1000);
      };

      // Filter and normalize chart data with validation
      const normalizedData = data
        .filter((item) => {
          // Validate item has required fields
          if (
            !item ||
            (item.value === undefined &&
              item.close === undefined &&
              item.price === undefined)
          ) {
            return false;
          }
          return true;
        })
        .map((item) => {
          try {
            const time = normalizeTime(item.time);
            const value = item.value ?? item.close ?? item.price ?? 0;
            const open = item.open ?? value;
            const high = item.high ?? value;
            const low = item.low ?? value;
            const close = item.close ?? value;

            // Validate numeric values
            if (
              !isFinite(time) ||
              !isFinite(value) ||
              !isFinite(open) ||
              !isFinite(high) ||
              !isFinite(low) ||
              !isFinite(close)
            ) {
              return null;
            }

            return {
              time: time as any, // UTCTimestamp
              open: Math.max(0, open),
              high: Math.max(0, high),
              low: Math.max(0, low),
              close: Math.max(0, close),
              value: Math.max(0, value),
            };
          } catch (error) {
            console.warn("Error normalizing chart data point:", error, item);
            return null;
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => a.time - b.time);

      // If no valid data, don't render chart
      if (normalizedData.length === 0) {
        return;
      }

      // Add series based on chart type
      if (chartType === "candlestick") {
        const series = chart.addSeries(CandlestickSeries, {
          upColor: colors.upColor,
          downColor: colors.downColor,
          borderVisible: false,
          wickUpColor: colors.upColor,
          wickDownColor: colors.downColor,
        });

        const candleData = normalizedData.map((item) => ({
          time: item.time,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));
        series.setData(candleData as any);
      } else if (chartType === "line") {
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

        const lineData = normalizedData.map((item) => ({
          time: item.time,
          value: item.value,
        }));
        series.setData(lineData as any);

        // Add area gradient effect
        series.applyOptions({
          lineType: 0,
        });
      } else if (chartType === "ohlc") {
        const series = chart.addSeries(BarSeries, {
          upColor: colors.upColor,
          downColor: colors.downColor,
          thinBars: false,
          openVisible: true,
        });

        const ohlcData = normalizedData.map((item) => ({
          time: item.time,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));
        series.setData(ohlcData as any);
      }

      chartRef.current = chart;
      chart.timeScale().fitContent();
    } catch (error) {
      console.error("Error rendering chart:", error);
    }

    // Handle resize (outside try-catch so it's always available for cleanup)
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function for useEffect
    return () => {
      window.removeEventListener("resize", handleResize);
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
          <span className="text-xs font-medium text-foreground-muted">
            {symbol}
          </span>
        </div>
      )}
      <div
        ref={chartContainerRef}
        className="w-full rounded-xl overflow-hidden border border-border"
        style={{ minHeight: "400px" }}
      />
    </div>
  );
}
