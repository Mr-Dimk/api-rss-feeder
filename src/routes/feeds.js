import express from 'express';
import { Low, JSONFile } from 'lowdb';
import { isValidToken } from '../models/user.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '../../db.json');
const db = new Low(new JSONFile(dbFile));

// Middleware: Require valid API token
router.use(async (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth || !isValidToken(auth.replace('Bearer ', ''))) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
  }
  await db.read();
  db.data ||= { feedItems: [] };
  next();
});

// GET /api/feeds – Get feed items (with date filtering)
router.get('/', async (req, res) => {
  try {
    let items = db.data.feedItems || [];
    const { from, to } = req.query;
    if (from) {
      items = items.filter(item => new Date(item.pubDate) >= new Date(from));
    }
    if (to) {
      items = items.filter(item => new Date(item.pubDate) <= new Date(to));
    }
    res.json({ feedItems: items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feed items' });
  }
});

export default router;
