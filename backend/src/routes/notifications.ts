import { Router } from 'express';
import { broadcast } from '../ws.js';

const router = Router();

router.post('/', (req, res) => {
  const { title, message } = req.body || {};
  broadcast({ type: 'notification', payload: { title, message, ts: Date.now() } });
  res.json({ status: 'sent' });
});

export default router;


