import { Router, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { broadcast } from "../ws.js";
import { asyncHandler } from "../utils/errors.js";
import { validate } from "../utils/validation.js";
import { z } from "zod";
import { logger } from "../utils/logger.js";

const router = Router();

const notificationSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  message: z.string().min(1).max(1000).trim(),
});

router.post(
  "/",
  validate(notificationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { title, message } = req.body;
    broadcast({
      type: "notification",
      payload: { title, message, ts: Date.now() },
    });
    logger.info("Notification broadcast", { title });
    res.json({ status: "sent" });
  })
);

export default router;
