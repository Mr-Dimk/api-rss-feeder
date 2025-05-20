import express from 'express';
import { isValidToken } from '../models/user.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  createSubscription,
  validateSubscription,
} from '../models/subscription.js';
import logger from '../logger.js';

const router = express.Router();

// Setup lowdb (moved to per-request async function)
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '../../db.json');
async function getDb() {
  const db = new Low(new JSONFile(dbFile), { subscriptions: [] });
  await db.read();
  db.data ||= { subscriptions: [] };
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

// GET /api/subscriptions – List all subscriptions
router.get('/', async (req, res, next) => {
  try {
    const db = await getDb();
    res.json({ subscriptions: db.data.subscriptions });
  } catch (err) {
    logger.error('Failed to fetch subscriptions', err);
    next(err);
  }
});

// POST /api/subscriptions – Subscribe to new RSS feed
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = validateSubscription(req.body);
    if (error) {
      logger.warn('Subscription validation failed', error.details[0]);
      return res.status(400).json({ error: error.details[0].message });
    }
    const db = await getDb();
    // Check for duplicate feedUrl
    const exists = db.data.subscriptions.some(
      (sub) => sub.feedUrl === value.feedUrl
    );
    if (exists) {
      logger.warn('Subscription already exists for this feed URL');
      return res
        .status(409)
        .json({ error: 'Subscription already exists for this feed URL' });
    }
    const subscription = createSubscription(value);
    db.data.subscriptions.push(subscription);
    await db.write();
    logger.info('Subscription created', { id: subscription.id });
    res.status(201).json({ subscription });
  } catch (err) {
    logger.error('Failed to create subscription', err);
    next(err);
  }
});

// DELETE /api/subscriptions – Clear all subscriptions
router.delete('/', async (req, res, next) => {
  try {
    const db = await getDb();
    db.data.subscriptions = [];
    await db.write();
    logger.info('All subscriptions cleared');
    res.status(204).send();
  } catch (err) {
    logger.error('Failed to clear subscriptions', err);
    next(err);
  }
});

// DELETE /api/subscriptions/:id – Remove specific subscription
router.delete('/:id', async (req, res, next) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const idx = db.data.subscriptions.findIndex((sub) => sub.id === id);
    if (idx === -1) {
      logger.warn('Subscription not found', { id });
      return res.status(404).json({ error: 'Subscription not found' });
    }
    db.data.subscriptions.splice(idx, 1);
    await db.write();
    logger.info('Subscription deleted', { id });
    res.status(204).send();
  } catch (err) {
    logger.error('Failed to delete subscription', err);
    next(err);
  }
});

export default router;
