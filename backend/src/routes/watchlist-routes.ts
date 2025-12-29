import express from "express";
import { StatusCodes } from "http-status-codes";
import {
  createWatchlist,
  getWatchlistById,
  getWatchlistsForUser,
  addItemToWatchlist,
  removeItemFromWatchlist,
  getWatchlistWithItems,
} from "../models/mock-watchlist.js";
import { asyncHandler } from "../utils/errors.js";
import { AppError } from "../utils/errors.js";
import { validate, watchlistSchemas } from "../utils/validation.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Get all watchlists for a user
router.get(
  "/watchlists",
  validate(watchlistSchemas.getWatchlists, "query"),
  asyncHandler(async (req, res) => {
    const { userId } = req.query as { userId: string };
    const watchlists = await getWatchlistsForUser(userId);
    logger.debug("Retrieved watchlists", { userId, count: watchlists.length });
    res.json(watchlists);
  })
);

// Get a specific watchlist by ID with items
router.get(
  "/watchlists/:id",
  validate(watchlistSchemas.watchlistId, "params"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id as string);
    const watchlist = await getWatchlistWithItems(id);

    if (!watchlist) {
      throw new AppError(StatusCodes.NOT_FOUND, "Watchlist not found");
    }

    logger.debug("Retrieved watchlist", {
      id,
      itemCount: watchlist.items.length,
    });
    res.json(watchlist);
  })
);

// Create a new watchlist
router.post(
  "/watchlists",
  validate(watchlistSchemas.createWatchlist),
  asyncHandler(async (req, res) => {
    const { name, userId } = req.body;
    const watchlist = await createWatchlist(name, userId);
    logger.info("Created watchlist", { id: watchlist.id, name, userId });
    res.status(StatusCodes.CREATED).json(watchlist);
  })
);

// Add an item to a watchlist
router.post(
  "/watchlists/:id/items",
  validate(watchlistSchemas.watchlistId, "params"),
  validate(watchlistSchemas.addItem),
  asyncHandler(async (req, res) => {
    const watchlistId = Number(req.params.id);
    const { symbol } = req.body;
    const item = await addItemToWatchlist(watchlistId, symbol);
    logger.info("Added item to watchlist", {
      watchlistId,
      symbol,
      itemId: item.id,
    });
    res.status(StatusCodes.CREATED).json(item);
  })
);

// Remove an item from a watchlist
router.delete(
  "/watchlists/:id/items/:symbol",
  validate(watchlistSchemas.watchlistId, "params"),
  validate(watchlistSchemas.symbol, "params"),
  asyncHandler(async (req, res) => {
    const watchlistId = Number(req.params.id);
    const symbol = String(req.params.symbol);
    const removed = await removeItemFromWatchlist(watchlistId, symbol);

    if (!removed) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        "Symbol not found in watchlist"
      );
    }

    logger.info("Removed item from watchlist", { watchlistId, symbol });
    res.status(StatusCodes.NO_CONTENT).send();
  })
);

export default router;
