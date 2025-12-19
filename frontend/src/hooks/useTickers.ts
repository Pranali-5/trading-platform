"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { getWebSocketUrl } from "@/lib/websocket";

export interface Ticker {
  symbol: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  ts: number;
}

interface WebSocketMessage {
  type: string;
  payload?: Ticker;
  ts?: number;
}

export function useTickers(limit = 100) {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    const url = getWebSocketUrl();

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          if (data?.type === "ticker" && data?.payload) {
            const ticker = data.payload;
            setTickers((prev) => {
              // Check if we already have this exact update
              const exists = prev.some(
                (t) => t.symbol === ticker.symbol && t.ts === ticker.ts
              );
              if (exists) return prev;

              // Add new ticker and maintain limit
              const updated = [ticker, ...prev].slice(0, limit);
              return updated;
            });
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;

        // Attempt reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          setConnectionError(
            "Unable to connect to market data. Please refresh."
          );
        }
      };

      ws.onerror = () => {
        setConnectionError("Connection error");
      };
    } catch {
      setConnectionError("Failed to establish connection");
    }
  }, [limit]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return tickers;
}

// Hook to get connection status
export function useWebSocketStatus() {
  const [status, setStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  useEffect(() => {
    const url = getWebSocketUrl();
    const ws = new WebSocket(url);

    ws.onopen = () => setStatus("connected");
    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("disconnected");

    return () => ws.close();
  }, []);

  return status;
}
