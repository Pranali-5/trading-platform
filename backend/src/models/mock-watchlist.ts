import { Watchlist, WatchlistItem, WatchlistWithItems } from "./watchlist.js";
import { logger } from "../utils/logger.js";

// In-memory storage for mock data
const watchlists: Map<number, Watchlist> = new Map();
const watchlistItems: Map<number, WatchlistItem[]> = new Map();
let nextWatchlistId = 1;
let nextItemId = 1;

export async function createWatchlist(
  name: string,
  userId: string
): Promise<Watchlist> {
  const id = nextWatchlistId++;
  const newWatchlist: Watchlist = {
    name,
    user_id: userId,
    id,
    created_at: new Date(),
    updated_at: new Date(),
  };

  watchlists.set(id, newWatchlist);
  watchlistItems.set(id, []);
  logger.debug("Created watchlist", { id, name, userId });
  return newWatchlist;
}

export async function getWatchlistsForUser(
  userId: string
): Promise<Watchlist[]> {
  const result: Watchlist[] = [];
  for (const watchlist of watchlists.values()) {
    if (watchlist.user_id === userId) {
      result.push(watchlist);
    }
  }
  logger.debug("Retrieved watchlists for user", {
    userId,
    count: result.length,
  });
  return result;
}

export async function getWatchlistById(id: number): Promise<Watchlist | null> {
  const watchlist = watchlists.get(id) || null;
  logger.debug("Retrieved watchlist by ID", { id, found: !!watchlist });
  return watchlist;
}

export async function updateWatchlist(
  id: number,
  name: string
): Promise<boolean> {
  const watchlist = watchlists.get(id);
  if (!watchlist) {
    logger.debug("Watchlist not found for update", { id });
    return false;
  }

  watchlist.name = name;
  watchlist.updated_at = new Date();
  watchlists.set(id, watchlist);
  logger.debug("Updated watchlist", { id, name });
  return true;
}

export async function deleteWatchlist(id: number): Promise<boolean> {
  const exists = watchlists.has(id);
  if (exists) {
    watchlists.delete(id);
    watchlistItems.delete(id);
    logger.debug("Deleted watchlist", { id });
  } else {
    logger.debug("Watchlist not found for deletion", { id });
  }
  return exists;
}

export async function addItemToWatchlist(
  watchlistId: number,
  symbol: string
): Promise<WatchlistItem> {
  const items = watchlistItems.get(watchlistId) || [];

  // Check if symbol already exists
  const existingItem = items.find((i) => i.symbol === symbol);
  if (existingItem) {
    logger.debug("Symbol already exists in watchlist", { watchlistId, symbol });
    return existingItem;
  }

  const id = nextItemId++;
  const newItem: WatchlistItem = {
    watchlist_id: watchlistId,
    symbol,
    id,
    added_at: new Date(),
  };

  items.push(newItem);
  watchlistItems.set(watchlistId, items);
  logger.debug("Added item to watchlist", { watchlistId, symbol, itemId: id });
  return newItem;
}

export async function removeItemFromWatchlist(
  watchlistId: number,
  symbol: string
): Promise<boolean> {
  const items = watchlistItems.get(watchlistId) || [];
  const initialLength = items.length;

  const filteredItems = items.filter((item) => item.symbol !== symbol);
  if (filteredItems.length === initialLength) {
    logger.debug("Symbol not found in watchlist", { watchlistId, symbol });
    return false;
  }

  watchlistItems.set(watchlistId, filteredItems);
  logger.debug("Removed symbol from watchlist", { watchlistId, symbol });
  return true;
}

export async function getWatchlistItems(
  watchlistId: number
): Promise<WatchlistItem[]> {
  const items = watchlistItems.get(watchlistId) || [];
  logger.debug("Retrieved watchlist items", {
    watchlistId,
    count: items.length,
  });
  return items;
}

export async function getWatchlistWithItems(
  watchlistId: number
): Promise<WatchlistWithItems | null> {
  const watchlist = await getWatchlistById(watchlistId);
  if (!watchlist) return null;

  const items = await getWatchlistItems(watchlistId);
  logger.debug("Retrieved watchlist with items", {
    watchlistId,
    itemCount: items.length,
  });
  return { ...watchlist, items };
}
