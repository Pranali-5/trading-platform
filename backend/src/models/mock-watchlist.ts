import { Watchlist, WatchlistItem, WatchlistWithItems } from './watchlist.js';

// In-memory storage for mock data
const watchlists: Map<number, Watchlist> = new Map();
const watchlistItems: Map<number, WatchlistItem[]> = new Map();
let nextWatchlistId = 1;
let nextItemId = 1;

export async function createWatchlist(name: string, userId: string): Promise<Watchlist> {
  const id = nextWatchlistId++;
  const newWatchlist: Watchlist = {
    name,
    user_id: userId,
    id,
    created_at: new Date(),
    updated_at: new Date()
  };
  
  watchlists.set(id, newWatchlist);
  watchlistItems.set(id, []);
  console.log(`Mock: Created watchlist with ID ${id}`);
  return newWatchlist;
}

export async function getWatchlistsForUser(userId: string): Promise<Watchlist[]> {
  const result: Watchlist[] = [];
  for (const watchlist of watchlists.values()) {
    if (watchlist.user_id === userId) {
      result.push(watchlist);
    }
  }
  console.log(`Mock: Retrieved ${result.length} watchlists for user ${userId}`);
  return result;
}

export async function getWatchlistById(id: number): Promise<Watchlist | null> {
  const watchlist = watchlists.get(id) || null;
  console.log(`Mock: Retrieved watchlist with ID ${id}:`, watchlist ? 'found' : 'not found');
  return watchlist;
}

export async function updateWatchlist(id: number, name: string): Promise<boolean> {
  const watchlist = watchlists.get(id);
  if (!watchlist) {
    console.log(`Mock: Watchlist with ID ${id} not found for update`);
    return false;
  }
  
  watchlist.name = name;
  watchlist.updated_at = new Date();
  watchlists.set(id, watchlist);
  console.log(`Mock: Updated watchlist with ID ${id} to name ${name}`);
  return true;
}

export async function deleteWatchlist(id: number): Promise<boolean> {
  const exists = watchlists.has(id);
  if (exists) {
    watchlists.delete(id);
    watchlistItems.delete(id);
    console.log(`Mock: Deleted watchlist with ID ${id}`);
  } else {
    console.log(`Mock: Watchlist with ID ${id} not found for deletion`);
  }
  return exists;
}

export async function addItemToWatchlist(watchlistId: number, symbol: string): Promise<WatchlistItem> {
  const items = watchlistItems.get(watchlistId) || [];
  
  // Check if symbol already exists
  const existingItem = items.find(i => i.symbol === symbol);
  if (existingItem) {
    console.log(`Mock: Symbol ${symbol} already exists in watchlist ${watchlistId}`);
    return existingItem;
  }
  
  const id = nextItemId++;
  const newItem: WatchlistItem = {
    watchlist_id: watchlistId,
    symbol,
    id,
    added_at: new Date()
  };
  
  items.push(newItem);
  watchlistItems.set(watchlistId, items);
  console.log(`Mock: Added item ${symbol} to watchlist ${watchlistId} with ID ${id}`);
  return newItem;
}

export async function removeItemFromWatchlist(watchlistId: number, symbol: string): Promise<boolean> {
  const items = watchlistItems.get(watchlistId) || [];
  const initialLength = items.length;
  
  const filteredItems = items.filter(item => item.symbol !== symbol);
  if (filteredItems.length === initialLength) {
    console.log(`Mock: Symbol ${symbol} not found in watchlist ${watchlistId}`);
    return false;
  }
  
  watchlistItems.set(watchlistId, filteredItems);
  console.log(`Mock: Removed symbol ${symbol} from watchlist ${watchlistId}`);
  return true;
}

export async function getWatchlistItems(watchlistId: number): Promise<WatchlistItem[]> {
  const items = watchlistItems.get(watchlistId) || [];
  console.log(`Mock: Retrieved ${items.length} items for watchlist ${watchlistId}`);
  return items;
}

export async function getWatchlistWithItems(watchlistId: number): Promise<WatchlistWithItems | null> {
  const watchlist = await getWatchlistById(watchlistId);
  if (!watchlist) return null;
  
  const items = await getWatchlistItems(watchlistId);
  console.log(`Mock: Retrieved watchlist ${watchlistId} with ${items.length} items`);
  return { ...watchlist, items };
}