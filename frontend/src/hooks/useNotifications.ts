"use client";
import { useEffect, useRef, useState } from "react";
import { getWebSocketUrl } from "@/lib/websocket";

type Notification = { title?: string; message?: string; ts: number };

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = getWebSocketUrl();
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === "notification" && data?.payload) {
          setNotifications((prev) => [data.payload as Notification, ...prev]);
        }
      } catch {
        // ignore
      }
    };
    return () => ws.close();
  }, []);

  return notifications;
}
