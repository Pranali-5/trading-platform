import express from 'express';
import { createWatchlist, getWatchlistById, getWatchlistsForUser, addItemToWatchlist, removeItemFromWatchlist, getWatchlistWithItems } from '../models/mock-watchlist.js';

const router = express.Router();

// Get all watchlists for a user
router.get('/watchlists', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const watchlists = await getWatchlistsForUser(userId);
    res.json(watchlists);
  } catch (error) {
    console.error('Error getting watchlists:', error);
    res.status(500).json({ error: 'Failed to get watchlists' });
  }
});

// Get a specific watchlist by ID with items
router.get('/watchlists/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const watchlist = await getWatchlistWithItems(id);
    
    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }
    
    res.json(watchlist);
  } catch (error) {
    console.error('Error getting watchlist:', error);
    res.status(500).json({ error: 'Failed to get watchlist' });
  }
});

// Create a new watchlist
router.post('/watchlists', async (req, res) => {
  try {
    const { name, userId } = req.body;
    
    if (!name || !userId) {
      return res.status(400).json({ error: 'Name and userId are required' });
    }
    
    const watchlist = await createWatchlist(name, userId);
    res.status(201).json(watchlist);
  } catch (error) {
    console.error('Error creating watchlist:', error);
    res.status(500).json({ error: 'Failed to create watchlist' });
  }
});

// Add an item to a watchlist
router.post('/watchlists/:id/items', async (req, res) => {
  try {
    const watchlistId = parseInt(req.params.id);
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    const item = await addItemToWatchlist(watchlistId, symbol);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error adding item to watchlist:', error);
    res.status(500).json({ error: 'Failed to add item to watchlist' });
  }
});

// Remove an item from a watchlist
router.delete('/watchlists/:id/items/:symbol', async (req, res) => {
  try {
    const watchlistId = parseInt(req.params.id);
    const symbol = req.params.symbol;
    
    await removeItemFromWatchlist(watchlistId, symbol);
    res.status(204).send();
  } catch (error) {
    console.error('Error removing item from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove item from watchlist' });
  }
});

export default router;