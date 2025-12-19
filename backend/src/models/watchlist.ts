import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { createPool } from '../db.js';

export interface Watchlist {
  id?: number;
  name: string;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface WatchlistItem {
  id?: number;
  watchlist_id: number;
  symbol: string;
  added_at?: Date;
}

export interface WatchlistWithItems extends Watchlist {
  items: WatchlistItem[];
}

export async function createWatchlist(watchlist: Watchlist): Promise<number> {
  try {
    const pool = await createPool();
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO watchlists (name, user_id) VALUES (?, ?)',
      [watchlist.name, watchlist.user_id]
    );
    return result.insertId;
  } catch (error: unknown) {
    console.error('Error creating watchlist:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export async function getWatchlistsByUserId(userId: string): Promise<Watchlist[]> {
  const pool = await createPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM watchlists WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows as Watchlist[];
}

export async function getWatchlistById(id: number): Promise<Watchlist | null> {
  const pool = await createPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM watchlists WHERE id = ?',
    [id]
  );
  return rows.length ? rows[0] as Watchlist : null;
}

export async function updateWatchlist(id: number, name: string): Promise<boolean> {
  const pool = await createPool();
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE watchlists SET name = ? WHERE id = ?',
    [name, id]
  );
  return result.affectedRows > 0;
}

export async function deleteWatchlist(id: number): Promise<boolean> {
  const pool = await createPool();
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM watchlists WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

export async function addItemToWatchlist(item: WatchlistItem): Promise<number> {
  const pool = await createPool();
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO watchlist_items (watchlist_id, symbol) VALUES (?, ?)',
    [item.watchlist_id, item.symbol]
  );
  return result.insertId;
}

export async function removeItemFromWatchlist(watchlistId: number, symbol: string): Promise<boolean> {
  const pool = await createPool();
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM watchlist_items WHERE watchlist_id = ? AND symbol = ?',
    [watchlistId, symbol]
  );
  return result.affectedRows > 0;
}

export async function getWatchlistItems(watchlistId: number): Promise<WatchlistItem[]> {
  const pool = await createPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM watchlist_items WHERE watchlist_id = ? ORDER BY added_at DESC',
    [watchlistId]
  );
  return rows as WatchlistItem[];
}

export async function getWatchlistWithItems(watchlistId: number): Promise<WatchlistWithItems | null> {
  const watchlist = await getWatchlistById(watchlistId);
  if (!watchlist) return null;
  
  const items = await getWatchlistItems(watchlistId);
  return { ...watchlist, items };
}