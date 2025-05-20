import express from 'express';
import { isValidToken } from '../models/user.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import logger from '../logger.js';

const router = express.Router();

// Setup lowdb (moved to per-request async function)
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '../../db.json');
async function getDb() {
  const db = new Low(new JSONFile(dbFile), { feedItems: [] });
  await db.read();
  db.data ||= { feedItems: [] };
  return db;
}

// Middleware: Require valid API token
router.use(async (req, res, next) => {
  try {
    const auth = req.headers['authorization'];
    if (!auth || !isValidToken(auth.replace('Bearer ', ''))) {
      logger.warn('Unauthorized: Invalid or missing token');
      return res
        .status(401)
        .json({ error: 'Unauthorized: Invalid or missing token' });
    }
    next();
  } catch (err) {
    logger.error('Error in auth middleware', err);
    next(err);
  }
});

// GET /api/feeds – Get feed items (with date filtering)
router.get('/', async (req, res, next) => {
  try {
    const db = await getDb();
    let items = db.data.feedItems || [];
    const { from, to } = req.query;
    if (from) {
      items = items.filter((item) => new Date(item.pubDate) >= new Date(from));
    }
    if (to) {
      items = items.filter((item) => new Date(item.pubDate) <= new Date(to));
    }
    res.json({ feedItems: items });
  } catch (err) {
    logger.error('Failed to fetch feed items', err);
    next(err);
  }
});

export default router;
