/**
 * Normalizes a WebSocket URL by ensuring it has the correct protocol
 * and removing any duplicate protocol prefixes
 */
export function normalizeWebSocketUrl(
  url: string | undefined,
  fallback: string
): string {
  if (!url) {
    return fallback;
  }

  // Remove any whitespace
  url = url.trim();

  // If URL already starts with ws:// or wss://, return as-is
  if (url.startsWith("ws://") || url.startsWith("wss://")) {
    return url;
  }

  // If URL starts with http://, convert to ws://
  if (url.startsWith("http://")) {
    return url.replace("http://", "ws://");
  }

  // If URL starts with https://, convert to wss://
  if (url.startsWith("https://")) {
    return url.replace("https://", "wss://");
  }

  // If URL has a malformed protocol like "wss://https://", fix it
  if (url.includes("wss://https://") || url.includes("ws://https://")) {
    url = url.replace(/wss?:\/\/https?:\/\//g, "wss://");
  }
  if (url.includes("wss://http://") || url.includes("ws://http://")) {
    url = url.replace(/wss?:\/\/http:\/\//g, "ws://");
  }

  // If no protocol, assume wss:// for production (https) or ws:// for localhost
  if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
    // Check if it's localhost or local development
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
      return `ws://${url}`;
    }
    // Otherwise use wss:// for production
    return `wss://${url}`;
  }

  return url;
}

/**
 * Gets the WebSocket URL from environment variables with proper normalization
 */
export function getWebSocketUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_WS_URL;
  const defaultUrl =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "wss://localhost:4000/ws"
      : "ws://localhost:4000/ws";

  return normalizeWebSocketUrl(envUrl, defaultUrl);
}

/**
 * Creates a WebSocket connection with proper URL normalization
 */
export function createWebSocket(url?: string): WebSocket {
  const wsUrl = url
    ? normalizeWebSocketUrl(url, "ws://localhost:4000/ws")
    : getWebSocketUrl();
  return new WebSocket(wsUrl);
}
