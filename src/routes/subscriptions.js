import express from 'express';
import { Low, JSONFile } from 'lowdb';
import { isValidToken } from '../models/user.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  createSubscription,
  validateSubscription,
} from '../models/subscription.js';

const router = express.Router();

// Setup lowdb
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbFile = join(__dirname, '../../db.json');
const db = new Low(new JSONFile(dbFile));

// Middleware: Require valid API token
router.use(async (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth || !isValidToken(auth.replace('Bearer ', ''))) {
    return res
      .status(401)
      .json({ error: 'Unauthorized: Invalid or missing token' });
  }
  await db.read();
  db.data ||= { subscriptions: [] };
  next();
});

// GET /api/subscriptions – List all subscriptions
router.get('/', async (req, res) => {
  try {
    res.json({ subscriptions: db.data.subscriptions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// POST /api/subscriptions – Subscribe to new RSS feed
router.post('/', async (req, res) => {
  try {
    const { error, value } = validateSubscription(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    // Check for duplicate feedUrl
    const exists = db.data.subscriptions.some(
      (sub) => sub.feedUrl === value.feedUrl
    );
    if (exists) {
      return res
        .status(409)
        .json({ error: 'Subscription already exists for this feed URL' });
    }
    const subscription = createSubscription(value);
    db.data.subscriptions.push(subscription);
    await db.write();
    res.status(201).json({ subscription });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// DELETE /api/subscriptions – Clear all subscriptions
router.delete('/', async (req, res) => {
  try {
    db.data.subscriptions = [];
    await db.write();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear subscriptions' });
  }
});

// DELETE /api/subscriptions/:id – Remove specific subscription
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idx = db.data.subscriptions.findIndex((sub) => sub.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    db.data.subscriptions.splice(idx, 1);
    await db.write();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

export default router;
