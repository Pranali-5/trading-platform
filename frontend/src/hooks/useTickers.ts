'use client'
import { useEffect, useRef, useState } from 'react';

type Ticker = { symbol: string; price: number; ts: number };

export function useTickers(limit = 10) {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('data', data)
        if (data?.type === 'ticker' && data?.payload) {
          setTickers((prev) => [data.payload as Ticker, ...prev].slice(0, limit));
        }
      } catch {}
    };
    return () => ws.close();
  }, [limit]);

  return tickers;
}


