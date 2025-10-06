import express from 'express';
import {
  createWatchlist,
  getWatchlistsByUserId,
  getWatchlistWithItems,
  updateWatchlist,
  deleteWatchlist,
  addItemToWatchlist,
  removeItemFromWatchlist
} from '../models/watchlist';

const router = express.Router();

/**
 * @swagger
 * /api/watchlists:
 *   get:
 *     summary: Get all watchlists for a user
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of watchlists
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const watchlists = await getWatchlistsByUserId(userId);
    res.json(watchlists);
  } catch (error) {
    console.error('Error getting watchlists:', error);
    res.status(500).json({ error: 'Failed to get watchlists' });
  }
});

/**
 * @swagger
 * /api/watchlists/{id}:
 *   get:
 *     summary: Get a watchlist by ID with its items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Watchlist with items
 *       404:
 *         description: Watchlist not found
 */
router.get('/:id', async (req, res) => {
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

/**
 * @swagger
 * /api/watchlists:
 *   post:
 *     summary: Create a new watchlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - userId
 *             properties:
 *               name:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Watchlist created
 */
router.post('/', async (req, res) => {
  try {
    const { name, userId } = req.body;
    if (!name || !userId) {
      return res.status(400).json({ error: 'Name and userId are required' });
    }
    const watchlistId = await createWatchlist({ name, user_id: userId });
    res.status(201).json({ id: watchlistId, name, user_id: userId });
  } catch (error) {
    console.error('Error creating watchlist:', error);
    res.status(500).json({ error: 'Failed to create watchlist' });
  }
});

/**
 * @swagger
 * /api/watchlists/{id}:
 *   put:
 *     summary: Update a watchlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Watchlist updated
 *       404:
 *         description: Watchlist not found
 */
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const success = await updateWatchlist(id, name);
    if (!success) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }
    res.json({ id, name });
  } catch (error) {
    console.error('Error updating watchlist:', error);
    res.status(500).json({ error: 'Failed to update watchlist' });
  }
});

/**
 * @swagger
 * /api/watchlists/{id}:
 *   delete:
 *     summary: Delete a watchlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Watchlist deleted
 *       404:
 *         description: Watchlist not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await deleteWatchlist(id);
    if (!success) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }
    res.json({ message: 'Watchlist deleted' });
  } catch (error) {
    console.error('Error deleting watchlist:', error);
    res.status(500).json({ error: 'Failed to delete watchlist' });
  }
});

/**
 * @swagger
 * /api/watchlists/{id}/items:
 *   post:
 *     summary: Add an item to a watchlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - symbol
 *             properties:
 *               symbol:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item added to watchlist
 */
router.post('/:id/items', async (req, res) => {
  try {
    const watchlistId = parseInt(req.params.id);
    const { symbol } = req.body;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    const itemId = await addItemToWatchlist({ watchlist_id: watchlistId, symbol });
    res.status(201).json({ id: itemId, watchlist_id: watchlistId, symbol });
  } catch (error) {
    console.error('Error adding item to watchlist:', error);
    res.status(500).json({ error: 'Failed to add item to watchlist' });
  }
});

/**
 * @swagger
 * /api/watchlists/{id}/items/{symbol}:
 *   delete:
 *     summary: Remove an item from a watchlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from watchlist
 *       404:
 *         description: Item not found in watchlist
 */
router.delete('/:id/items/:symbol', async (req, res) => {
  try {
    const watchlistId = parseInt(req.params.id);
    const symbol = req.params.symbol;
    const success = await removeItemFromWatchlist(watchlistId, symbol);
    if (!success) {
      return res.status(404).json({ error: 'Item not found in watchlist' });
    }
    res.json({ message: 'Item removed from watchlist' });
  } catch (error) {
    console.error('Error removing item from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove item from watchlist' });
  }
});

export default router;